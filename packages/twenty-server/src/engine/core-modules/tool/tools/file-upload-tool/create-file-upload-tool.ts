import { Injectable, Logger } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { settings } from 'src/engine/constants/settings';
import { FileUploadException } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { CreateFileUploadToolInputZodSchema } from 'src/engine/core-modules/tool/tools/file-upload-tool/file-upload-tool.schema';
import { type CreateFileUploadToolInput } from 'src/engine/core-modules/tool/tools/file-upload-tool/types/create-file-upload-tool-input.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';

@Injectable()
export class CreateFileUploadTool implements Tool {
  private readonly logger = new Logger(CreateFileUploadTool.name);

  description = `Create an upload URL for a file in agent-chat storage. PUT the bytes to uploadUrl with the returned Content-Type, then call complete_file_upload. Requires UPLOAD_FILE permission. Maximum size ${settings.storage.maxDirectUploadFileSize}.`;
  inputSchema = CreateFileUploadToolInputZodSchema;

  constructor(private readonly fileUploadService: FileUploadService) {}

  async execute(
    parameters: CreateFileUploadToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    try {
      const uploadTarget = await this.fileUploadService.createFileUpload({
        workspaceId: context.workspaceId,
        filename: parameters.filename,
        size: parameters.size,
        fileFolder: FileFolder.AgentChat,
      });

      this.logger.log(
        `Created file upload ${uploadTarget.fileId} (${parameters.filename}) for workspace ${context.workspaceId}`,
      );

      return {
        success: true,
        message: 'Upload URL created.',
        result: {
          fileId: uploadTarget.fileId,
          uploadUrl: uploadTarget.uploadUrl,
          contentType: uploadTarget.contentType,
          expiresAt: uploadTarget.expiresAt,
        },
      };
    } catch (error) {
      if (error instanceof FileUploadException) {
        return {
          success: false,
          message: 'Failed to create file upload',
          error: error.message,
        };
      }

      this.logger.error(`Failed to create file upload: ${error}`);

      return {
        success: false,
        message: 'Failed to create file upload',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create file upload',
      };
    }
  }
}
