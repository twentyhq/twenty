import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

import {
  FilesFieldException,
  FilesFieldExceptionCode,
} from './files-field.exception';

@Injectable()
export class FilesFieldService {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async deleteFilesFieldFile({
    fileId,
    workspaceId,
  }: {
    fileId: string;
    workspaceId: string;
  }): Promise<void> {
    try {
      await this.fileStorageService.deleteByFileId({
        fileId,
        workspaceId,
        fileFolder: FileFolder.FilesField,
      });
    } catch (error) {
      throw new FilesFieldException(
        `Failed to delete file ${fileId}: ${error.message}`,
        FilesFieldExceptionCode.FILE_DELETION_FAILED,
      );
    }
  }
}
