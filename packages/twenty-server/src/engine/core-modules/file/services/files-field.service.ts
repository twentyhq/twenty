import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { Like, Repository } from 'typeorm';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';

@Injectable()
export class FilesFieldService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async moveFileFromTemporaryFilesFieldFolder({
    fileId,
    applicationId,
    workspaceId,
    workspaceCustomApplicationId,
  }: {
    fileId: string;
    applicationId: string;
    workspaceId: string;
    workspaceCustomApplicationId: string;
  }): Promise<void> {
    const file = await this.fileRepository.findOneOrFail({
      where: {
        id: fileId,
        workspaceId,
        applicationId: workspaceCustomApplicationId,
        path: Like(`${FileFolder.TemporaryFilesField}%`),
      },
    });

    const destinationPath = removeFileFolderFromFileEntityPath(file.path);

    await this.fileStorageService.moveFile({
      from: {
        fileFolder: FileFolder.TemporaryFilesField,
        destinationPath: destinationPath,
        applicationId: workspaceCustomApplicationId,
      },
      to: {
        fileFolder: FileFolder.FilesField,
        destinationPath: destinationPath,
        applicationId,
      },
      workspaceId,
    });
  }

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
