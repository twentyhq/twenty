import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import path from 'path';

import {
  type CodeExecutionData,
  type CodeExecutionFile,
  type CodeExecutionState,
} from 'twenty-shared/ai';
import { v4 } from 'uuid';

import {
  type InputFile,
  type OutputFile,
} from 'src/engine/core-modules/code-interpreter/drivers/interfaces/code-interpreter-driver.interface';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import {
  type AccessTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { CodeInterpreterInputZodSchema } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool.schema';
import { TWENTY_MCP_HELPER } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/twenty-mcp-helper.const';
import { type CodeInterpreterInput } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/types/code-interpreter-input.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';
import { getSecureAdapter } from 'src/engine/core-modules/tool/utils/get-secure-axios-adapter.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';

@Injectable()
export class CodeInterpreterTool implements Tool {
  private readonly logger = new Logger(CodeInterpreterTool.name);

  description =
    'Execute Python code in a sandboxed environment for data analysis, CSV processing, calculations, and chart generation. Returns stdout, stderr, and generated files. Input files are available at /home/user/{filename}. Save output files (charts, reports) to /home/user/output/ using plt.savefig() for matplotlib charts.';

  inputSchema = CodeInterpreterInputZodSchema;

  constructor(
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly fileStorageService: FileStorageService,
    private readonly fileService: FileService,
    private readonly httpService: HttpService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  private buildExecutionState(
    executionId: string,
    state: CodeExecutionState,
    code: string,
    stdout: string,
    stderr: string,
    files: CodeExecutionFile[],
    extras?: { exitCode?: number; executionTimeMs?: number; error?: string },
  ): CodeExecutionData {
    return {
      executionId,
      state,
      code,
      language: 'python',
      stdout,
      stderr,
      files,
      ...extras,
    };
  }

  async execute(
    parameters: ToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    const { workspaceId, userId, userWorkspaceId, onCodeExecutionUpdate } =
      context;
    const { code, files } = parameters as CodeInterpreterInput;
    const executionId = v4();
    const startTime = Date.now();

    let accumulatedStdout = '';
    let accumulatedStderr = '';
    const streamedFiles: CodeExecutionFile[] = [];

    onCodeExecutionUpdate?.(
      this.buildExecutionState(executionId, 'pending', code, '', '', []),
    );

    try {
      const inputFiles = await this.downloadInputFiles(files);

      this.logger.log(
        `Executing code interpreter with ${inputFiles.length} input files`,
      );

      onCodeExecutionUpdate?.(
        this.buildExecutionState(executionId, 'running', code, '', '', []),
      );

      const serverUrl = this.twentyConfigService.get('SERVER_URL');
      const sessionToken = this.generateSessionToken(
        workspaceId,
        userId,
        userWorkspaceId,
      );

      this.logger.debug(
        `MCP session: workspaceId=${workspaceId}, userId=${userId}, userWorkspaceId=${userWorkspaceId}, serverUrl=${serverUrl}`,
      );

      const codeWithHelper = TWENTY_MCP_HELPER + '\n\n' + code;

      const result = await this.codeInterpreterService.execute(
        codeWithHelper,
        inputFiles,
        {
          env: {
            TWENTY_SERVER_URL: serverUrl,
            TWENTY_API_TOKEN: sessionToken,
          },
        },
        {
          onStdout: (line) => {
            accumulatedStdout += line + '\n';
            onCodeExecutionUpdate?.(
              this.buildExecutionState(
                executionId,
                'running',
                code,
                accumulatedStdout,
                accumulatedStderr,
                streamedFiles,
              ),
            );
          },
          onStderr: (line) => {
            accumulatedStderr += line + '\n';
            onCodeExecutionUpdate?.(
              this.buildExecutionState(
                executionId,
                'running',
                code,
                accumulatedStdout,
                accumulatedStderr,
                streamedFiles,
              ),
            );
          },
          onResult: async (outputFile: OutputFile) => {
            const uploadedFile = await this.uploadSingleFile(
              outputFile,
              workspaceId,
              executionId,
            );

            if (uploadedFile) {
              streamedFiles.push(uploadedFile);
              onCodeExecutionUpdate?.(
                this.buildExecutionState(
                  executionId,
                  'running',
                  code,
                  accumulatedStdout,
                  accumulatedStderr,
                  streamedFiles,
                ),
              );
            }
          },
        },
      );

      this.logger.debug(
        `Execution result: exitCode=${result.exitCode}, stdout length=${result.stdout.length}, stderr length=${result.stderr.length}`,
      );

      const allOutputFileUrls = await this.uploadOutputFiles(
        result.files,
        workspaceId,
        executionId,
        streamedFiles,
      );

      const executionTimeMs = Date.now() - startTime;
      const finalState = result.exitCode === 0 ? 'completed' : 'error';

      onCodeExecutionUpdate?.(
        this.buildExecutionState(
          executionId,
          finalState,
          code,
          result.stdout || accumulatedStdout,
          result.stderr || accumulatedStderr,
          allOutputFileUrls,
          {
            exitCode: result.exitCode,
            executionTimeMs,
            error: result.error,
          },
        ),
      );

      return {
        success: result.exitCode === 0,
        message:
          result.exitCode === 0
            ? 'Code executed successfully'
            : 'Code execution failed',
        result: {
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
          files: allOutputFileUrls,
        },
        error: result.error,
      };
    } catch (error) {
      this.logger.error('Code interpreter execution failed', error);

      const executionTimeMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      onCodeExecutionUpdate?.(
        this.buildExecutionState(
          executionId,
          'error',
          code,
          accumulatedStdout,
          accumulatedStderr,
          streamedFiles,
          { executionTimeMs, error: errorMessage },
        ),
      );

      return {
        success: false,
        message: 'Code interpreter execution failed',
        error: errorMessage,
      };
    }
  }

  private async downloadInputFiles(
    files?: { filename: string; url: string }[],
  ): Promise<InputFile[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const inputFiles: InputFile[] = [];
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    for (const file of files) {
      try {
        if (file.url.startsWith('data:')) {
          const parsed = this.parseDataUrl(file.url);

          if (parsed) {
            inputFiles.push({
              filename: file.filename,
              content: parsed.content,
              mimeType: parsed.mimeType,
            });
          }
          continue;
        }

        // Allow requests to the server's own URL (for internal file downloads)
        // but block all other private/internal IPs to prevent SSRF attacks
        const isInternalFileUrl = file.url.startsWith(serverUrl);
        const adapter = isInternalFileUrl ? undefined : getSecureAdapter();

        const response = await this.httpService.axiosRef.get(file.url, {
          responseType: 'arraybuffer',
          timeout: 30_000,
          adapter,
        });

        inputFiles.push({
          filename: file.filename,
          content: Buffer.from(response.data),
          mimeType:
            response.headers['content-type'] ?? 'application/octet-stream',
        });
      } catch (error) {
        this.logger.warn(`Failed to download file ${file.filename}`, error);
      }
    }

    return inputFiles;
  }

  private parseDataUrl(
    dataUrl: string,
  ): { content: Buffer; mimeType: string } | null {
    // Format: data:{mimeType};base64,{base64data}
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

    if (!match) {
      return null;
    }

    const [, mimeType, base64Data] = match;

    return {
      content: Buffer.from(base64Data, 'base64'),
      mimeType,
    };
  }

  private generateSessionToken(
    workspaceId: string,
    userId?: string,
    userWorkspaceId?: string,
  ): string {
    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.ACCESS,
      workspaceId,
    );

    const payload: AccessTokenJwtPayload = {
      sub: userId ?? workspaceId,
      type: JwtTokenTypeEnum.ACCESS,
      workspaceId,
      userId: userId ?? workspaceId,
      userWorkspaceId: userWorkspaceId ?? workspaceId,
      authProvider: AuthProviderEnum.Password,
    };

    return this.jwtWrapperService.sign(payload, {
      secret,
      expiresIn: '5m', // Short-lived token for code execution session
    });
  }

  private async uploadSingleFile(
    file: OutputFile,
    workspaceId: string,
    executionId: string,
  ): Promise<CodeExecutionFile | null> {
    const subFolder = `${FileFolder.AgentChat}/code-interpreter/${executionId}`;
    const folder = `workspace-${workspaceId}/${subFolder}`;

    const sanitizedFilename = path.basename(file.filename);

    try {
      await this.fileStorageService.write({
        file: file.content,
        name: sanitizedFilename,
        mimeType: file.mimeType,
        folder,
      });

      const filePath = `${subFolder}/${sanitizedFilename}`;
      const signedPath = this.fileService.signFileUrl({
        url: filePath,
        workspaceId,
      });

      const serverUrl = this.twentyConfigService.get('SERVER_URL');

      return {
        filename: sanitizedFilename,
        url: `${serverUrl}/files/${signedPath}`,
        mimeType: file.mimeType,
      };
    } catch (error) {
      this.logger.warn(`Failed to upload output file ${file.filename}`, error);

      return null;
    }
  }

  private async uploadOutputFiles(
    files: OutputFile[],
    workspaceId: string,
    executionId: string,
    alreadyUploadedFiles: CodeExecutionFile[],
  ): Promise<CodeExecutionFile[]> {
    const subFolder = `${FileFolder.AgentChat}/code-interpreter/${executionId}`;
    const folder = `workspace-${workspaceId}/${subFolder}`;

    const outputFileUrls: CodeExecutionFile[] = [...alreadyUploadedFiles];
    const uploadedFilenames = new Set(
      alreadyUploadedFiles.map((f) => f.filename),
    );

    for (const file of files) {
      const sanitizedFilename = path.basename(file.filename);

      if (uploadedFilenames.has(sanitizedFilename)) {
        continue;
      }

      try {
        await this.fileStorageService.write({
          file: file.content,
          name: sanitizedFilename,
          mimeType: file.mimeType,
          folder,
        });

        const filePath = `${subFolder}/${sanitizedFilename}`;
        const signedPath = this.fileService.signFileUrl({
          url: filePath,
          workspaceId,
        });

        const serverUrl = this.twentyConfigService.get('SERVER_URL');

        outputFileUrls.push({
          filename: sanitizedFilename,
          url: `${serverUrl}/files/${signedPath}`,
          mimeType: file.mimeType,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to upload output file ${file.filename}`,
          error,
        );
      }
    }

    return outputFileUrls;
  }
}
