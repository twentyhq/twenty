import { BadRequestException, Injectable, Logger } from '@nestjs/common';

import { basename } from 'path';

import { isNonEmptyString } from '@sniptt/guards';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { settings } from 'src/engine/constants/settings';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageException } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileUploadException } from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';
import { checkFilename } from 'src/engine/core-modules/file/utils/check-file-name.utils';
import { decodeBase64FileContentOrThrow } from 'src/engine/core-modules/file/utils/decode-base64-file-content.util';
import { type UploadFileToolInput } from 'src/engine/core-modules/tool/tools/upload-file-tool/types/upload-file-tool-input.type';
import { UploadFileToolInputZodSchema } from 'src/engine/core-modules/tool/tools/upload-file-tool/upload-file-tool.schema';
import { type ToolExecutionContext } from 'src/engine/core-modules/tool/types/tool-execution-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';

const MCP_UPLOAD_RESOURCE_FOLDER = 'mcp-upload';

@Injectable()
export class UploadFileTool implements Tool {
  private readonly logger = new Logger(UploadFileTool.name);

  description = `Upload a file and return a fileId. Requires UPLOAD_FILE permission. Then attach it with create_one_attachment (file: [{ fileId, label }] and targetCompanyId / targetPersonId / …) or by setting a FILES field on create_one_* / update_one_*. Maximum size ${settings.storage.maxFileSize}. Content must be base64.`;
  inputSchema = UploadFileToolInputZodSchema;
  flag = PermissionFlagType.UPLOAD_FILE;

  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
  ) {}

  async execute(
    parameters: UploadFileToolInput,
    context: ToolExecutionContext,
  ): Promise<ToolOutput> {
    try {
      const sanitizedFilename = checkFilename(
        basename(parameters.filename.trim()),
      );
      const fileBuffer = decodeBase64FileContentOrThrow(parameters.content);
      const { workspaceCustomFlatApplication } =
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId: context.workspaceId },
        );

      const fileId = v4();
      const { ext } = buildFileInfo(sanitizedFilename);
      const name = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

      const savedFile = await this.fileStorageService.writeFile({
        sourceFile: fileBuffer,
        fileFolder: FileFolder.AgentChat,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        workspaceId: context.workspaceId,
        resourcePath: `${MCP_UPLOAD_RESOURCE_FOLDER}/${name}`,
        fileId,
        settings: {
          isTemporaryFile: true,
          toDelete: false,
        },
      });

      this.logger.log(
        `Uploaded file ${savedFile.id} (${sanitizedFilename}) for workspace ${context.workspaceId}`,
      );

      return {
        success: true,
        message: `File "${sanitizedFilename}" uploaded`,
        result: {
          fileId: savedFile.id,
          fullPath: savedFile.path,
          size: Number(savedFile.size),
          mimeType: savedFile.mimeType,
        },
      };
    } catch (error) {
      if (
        error instanceof FileStorageException ||
        error instanceof FileUploadException ||
        error instanceof BadRequestException
      ) {
        return {
          success: false,
          message: 'Failed to upload file',
          error: error.message,
        };
      }

      this.logger.error(`Failed to upload file: ${error}`);

      return {
        success: false,
        message: 'Failed to upload file',
        error: error instanceof Error ? error.message : 'Failed to upload file',
      };
    }
  }
}
