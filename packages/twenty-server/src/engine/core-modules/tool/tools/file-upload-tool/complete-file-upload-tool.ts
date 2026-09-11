import { Injectable, Logger } from '@nestjs/common';

import { FileUploadException } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { CompleteFileUploadToolInputZodSchema } from 'src/engine/core-modules/tool/tools/file-upload-tool/file-upload-tool.schema';
import { type CompleteFileUploadToolInput } from 'src/engine/core-modules/tool/tools/file-upload-tool/types/complete-file-upload-tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';

@Injectable()
export class CompleteFileUploadTool implements Tool {
  private readonly logger = new Logger(CompleteFileUploadTool.name);

  description =
    'Confirm a direct upload after the client has PUT bytes to the uploadUrl from create_file_upload. Returns a fileId for FILES fields or code_interpreter.files. Requires UPLOAD_FILE permission.';
  inputSchema = CompleteFileUploadToolInputZodSchema;

  constructor(private readonly fileUploadService: FileUploadService) {}

  async execute(
    parameters: CompleteFileUploadToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    try {
      const completedFile = await this.fileUploadService.completeFileUpload({
        workspaceId: context.workspaceId,
        fileId: parameters.fileId,
      });

      this.logger.log(
        `Completed file upload ${completedFile.id} for workspace ${context.workspaceId}`,
      );

      return {
        success: true,
        message: 'File upload completed',
        result: {
          fileId: completedFile.id,
          path: completedFile.path,
          mimeType: completedFile.mimeType,
          size: Number(completedFile.size),
        },
      };
    } catch (error) {
      if (error instanceof FileUploadException) {
        return {
          success: false,
          message: 'Failed to complete file upload',
          error: error.message,
        };
      }

      this.logger.error(`Failed to complete file upload: ${error}`);

      return {
        success: false,
        message: 'Failed to complete file upload',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to complete file upload',
      };
    }
  }
}
