import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';

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
    await this.fileStorageService.deleteByFileId({
      fileId,
      workspaceId,
      fileFolder: FileFolder.FilesField,
    });
  }
}
