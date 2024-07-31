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
    workspaceId: string | undefined,
  ): Promise<Stream> {
    const workspaceFolderPath = workspaceId
      ? `workspace-${workspaceId}/${folderPath}`
      : folderPath;

    try {
      return await this.fileStorageService.read({
        folderPath: workspaceFolderPath,
        filename: filename,
      });
    } catch (error) {
      if (
        error instanceof FileStorageException &&
        error.code === FileStorageExceptionCode.FILE_NOT_FOUND
      ) {
        return await this.fileStorageService.read({
          folderPath: folderPath,
          filename: filename,
        });
      }
      throw error;
    }
  }
}
