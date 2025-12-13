import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { v4 } from 'uuid';

import { type InputFile } from 'src/engine/core-modules/code-interpreter/drivers/interfaces/code-interpreter-driver.interface';
import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { CodeInterpreterToolParametersZodSchema } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool.schema';
import { type CodeInterpreterInput } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/types/code-interpreter-input.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class CodeInterpreterTool implements Tool {
  private readonly logger = new Logger(CodeInterpreterTool.name);

  description =
    'Execute Python code in a sandboxed environment for data analysis, CSV processing, calculations, and chart generation. Returns stdout, stderr, and generated files. Input files are available at /home/user/{filename}. Save output files (charts, reports) to /home/user/output/ using plt.savefig() for matplotlib charts.';

  inputSchema = CodeInterpreterToolParametersZodSchema;

  constructor(
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly fileStorageService: FileStorageService,
    private readonly fileService: FileService,
    private readonly httpService: HttpService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async execute(
    parameters: ToolInput,
    workspaceId: string,
  ): Promise<ToolOutput> {
    const { code, files } = parameters as CodeInterpreterInput;

    try {
      const inputFiles = await this.downloadInputFiles(files);

      this.logger.log(
        `Executing code interpreter with ${inputFiles.length} input files`,
      );

      const result = await this.codeInterpreterService.execute(
        code,
        inputFiles,
      );

      const outputFileUrls = await this.uploadOutputFiles(
        result.files,
        workspaceId,
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
          files: outputFileUrls,
        },
        error: result.error,
      };
    } catch (error) {
      this.logger.error('Code interpreter execution failed', error);

      return {
        success: false,
        message: 'Code interpreter execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
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

    for (const file of files) {
      try {
        // Handle data URLs (base64 encoded)
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

        // Handle HTTP URLs
        const response = await this.httpService.axiosRef.get(file.url, {
          responseType: 'arraybuffer',
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

  private async uploadOutputFiles(
    files: { filename: string; content: Buffer; mimeType: string }[],
    workspaceId: string,
  ): Promise<{ filename: string; url: string }[]> {
    const executionId = v4();
    const outputFileUrls: { filename: string; url: string }[] = [];
    const subFolder = `${FileFolder.AgentChat}/code-interpreter/${executionId}`;
    const folder = `workspace-${workspaceId}/${subFolder}`;

    for (const file of files) {
      try {
        await this.fileStorageService.write({
          file: file.content,
          name: file.filename,
          mimeType: file.mimeType,
          folder,
        });

        // Use the standard signFileUrl method for consistent URL generation
        const filePath = `${subFolder}/${file.filename}`;
        const signedPath = this.fileService.signFileUrl({
          url: filePath,
          workspaceId,
        });

        const serverUrl = this.twentyConfigService.get('SERVER_URL');

        outputFileUrls.push({
          filename: file.filename,
          url: `${serverUrl}/files/${signedPath}`,
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
