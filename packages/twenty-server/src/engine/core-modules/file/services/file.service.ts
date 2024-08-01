import { Injectable } from '@nestjs/common';

import { Stream } from 'stream';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/integrations/file-storage/interfaces/file-storage-exception';

import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';

@Injectable()
export class FileService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async getFileStream(
    folderPath: string,
    filename: string,
    workspaceId: string,
  ): Promise<Stream> {
    const workspaceFolderPath = `workspace-${workspaceId}/${folderPath}`;

    try {
      return await this.fileStorageService.read({
        folderPath: workspaceFolderPath,
        filename,
      });
    } catch (error) {
      // TODO: Remove this fallback when all files are moved to workspace folders
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return await this.fileStorageService.read({
          folderPath,
          filename,
        });
      }
      throw error;
    }
  }
}
