import { Injectable, Logger } from '@nestjs/common';

import path from 'path';

import { isNonEmptyString } from '@sniptt/guards';
import { CodeExecutionFile } from 'twenty-shared/ai';
import { FileFolder } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { OutputFile } from 'src/engine/core-modules/code-interpreter/drivers/interfaces/code-interpreter-driver.interface';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileWithSignedUrlDto } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';

@Injectable()
export class FileAgentChatService {
  private readonly logger = new Logger(FileAgentChatService.name);
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly applicationService: ApplicationService,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async uploadFile(
    file: OutputFile,
    workspaceId: string,
    executionId: string,
  ): Promise<CodeExecutionFile | null> {
    const subFolder = `${FileFolder.AgentChat}/code-interpreter/${executionId}`;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );
    const sanitizedFilename = path.basename(file.filename);

    try {
      const savedFile = await this.fileStorageService.writeFile({
        sourceFile: file.content,
        fileFolder: FileFolder.AgentChat,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        resourcePath: `${subFolder}/${sanitizedFilename}`,
        mimeType: file.mimeType,
        workspaceId,
        settings: {
          isTemporaryFile: true,
          toDelete: false,
        },
      });

      const signedUrl = this.fileUrlService.signFileByIdUrl({
        fileId: savedFile.id,
        workspaceId,
        fileFolder: FileFolder.AgentChat,
      });

      return {
        filename: sanitizedFilename,
        url: signedUrl,
        mimeType: file.mimeType,
      };
    } catch (error) {
      this.logger.warn(`Failed to upload output file ${file.filename}`, error);

      return null;
    }
  }

  async uploadFileFromClient({
    file,
    filename,
    mimeType,
    workspaceId,
  }: {
    file: Buffer;
    filename: string;
    mimeType: string;
    workspaceId: string;
  }): Promise<FileWithSignedUrlDto> {
    const { ext } = await extractFileInfo({
      file,
      filename,
    });

    const sanitizedFile = sanitizeFile({ file, ext, mimeType });

    const fileId = v4();
    const name = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const savedFile = await this.fileStorageService.writeFile({
      sourceFile: sanitizedFile,
      resourcePath: name,
      mimeType,
      fileFolder: FileFolder.AgentChat,
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      workspaceId,
      fileId,
      settings: {
        isTemporaryFile: true,
        toDelete: false,
      },
    });

    return {
      ...savedFile,
      url: this.fileUrlService.signFileByIdUrl({
        fileId,
        workspaceId,
        fileFolder: FileFolder.AgentChat,
      }),
    };
  }
}
