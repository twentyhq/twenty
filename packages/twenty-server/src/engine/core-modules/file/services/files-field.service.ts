import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

@Injectable()
export class FilesFieldService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async deleteFilesFieldFile({
    fileId,
    applicationId,
    workspaceId,
  }: {
    fileId: string;
    applicationId: string;
    workspaceId: string;
  }): Promise<void> {
    await this.fileStorageService.deleteByFileId({
      fileId,
      workspaceId,
      applicationId,
      fileFolder: FileFolder.FilesField,
    });
  }
}
