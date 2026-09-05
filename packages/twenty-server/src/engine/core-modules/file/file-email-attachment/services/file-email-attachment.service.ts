import { Injectable, Logger } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';

@Injectable()
export class FileEmailAttachmentService {
  private readonly logger = new Logger(FileEmailAttachmentService.name);

  constructor(private readonly fileStorageService: FileStorageService) {}

  async deleteFiles({
    fileIds,
    workspaceId,
  }: {
    fileIds: string[];
    workspaceId: string;
  }): Promise<void> {
    for (const fileId of fileIds) {
      try {
        await this.fileStorageService.deleteByFileId({
          fileId,
          workspaceId,
          fileFolder: FileFolder.EmailAttachment,
        });
      } catch (error) {
        this.logger.warn(
          `Failed to delete email attachment file ${fileId}: ${error}`,
        );
      }
    }
  }
}
