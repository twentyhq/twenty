import { Injectable, Logger } from '@nestjs/common';

import path from 'path';

import {
  type CodeExecutionData,
  type CodeExecutionFile,
  type CodeExecutionState,
} from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';

import {
  type InputFile,
  type OutputFile,
} from 'src/engine/core-modules/code-interpreter/drivers/interfaces/code-interpreter-driver.interface';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import {
  type AccessTokenJwtPayload,
  JwtTokenTypeEnum,
} from 'src/engine/core-modules/auth/types/auth-context.type';
import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { CodeInterpreterInputZodSchema } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool.schema';
import { TWENTY_MCP_HELPER } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/twenty-mcp-helper.const';
import {
  type CodeInterpreterFileInput,
  type CodeInterpreterInput,
} from 'src/engine/core-modules/tool/tools/code-interpreter-tool/types/code-interpreter-input.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
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
    private readonly fileUrlService: FileUrlService,
    private readonly applicationService: ApplicationService,
    private readonly secureHttpClientService: SecureHttpClientService,
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
      const inputFiles = await this.downloadInputFiles(files, workspaceId);

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
        error instanceof Error
          ? error.message
          : `Unexpected error: ${String(error)}`;

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
    files?: CodeInterpreterFileInput[],
    workspaceId?: string,
  ): Promise<InputFile[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const inputFiles: InputFile[] = [];

    for (const file of files) {
      try {
        if (!workspaceId) {
          this.logger.warn(
            `Cannot resolve file ${file.filename}: workspaceId is required`,
          );
          continue;
        }

        const { buffer, mimeType } = await this.fileService.getFileContentById({
          fileId: file.fileId,
          workspaceId,
          fileFolder: FileFolder.AgentChat,
        });

        inputFiles.push({
          filename: file.filename,
          content: buffer,
          mimeType,
        });
      } catch (error) {
        this.logger.warn(`Failed to resolve file ${file.filename}`, error);
      }
    }

    return inputFiles;
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
    const sanitizedFilename = path.basename(file.filename);

    try {
      const { workspaceCustomFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        );

      const fileId = v4();
      const resourcePath = `code-interpreter/${executionId}/${fileId}-${sanitizedFilename}`;

      const savedFile = await this.fileStorageService.writeFile({
        sourceFile: file.content,
        mimeType: file.mimeType,
        fileFolder: FileFolder.AgentChat,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        workspaceId,
        resourcePath,
        fileId,
        settings: {
          isTemporaryFile: false,
          toDelete: false,
        },
      });

      const signedUrl = this.fileUrlService.signFileByIdUrl({
        fileId: savedFile.id,
        workspaceId,
        fileFolder: FileFolder.AgentChat,
      });

      return {
        fileId: savedFile.id,
        filename: sanitizedFilename,
        url: signedUrl,
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
    const outputFileUrls: CodeExecutionFile[] = [...alreadyUploadedFiles];
    const uploadedFilenames = new Set(
      alreadyUploadedFiles.map((uploadedFile) => uploadedFile.filename),
    );

    for (const file of files) {
      const sanitizedFilename = path.basename(file.filename);

      if (uploadedFilenames.has(sanitizedFilename)) {
        continue;
      }

      const uploadedFile = await this.uploadSingleFile(
        file,
        workspaceId,
        executionId,
      );

      if (uploadedFile) {
        outputFileUrls.push(uploadedFile);
      }
    }

    return outputFileUrls;
  }
}
