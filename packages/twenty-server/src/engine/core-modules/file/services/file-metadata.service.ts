import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { extractFolderPathFilenameAndTypeOrThrow } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';

import { FileService } from './file.service';

@Injectable()
export class FileMetadataService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileService: FileService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  /**
   * @deprecated
   */
  async createFile({
    file,
    filename,
    mimeType,
    workspaceId,
  }: {
    file: Buffer;
    filename: string;
    mimeType: string;
    workspaceId: string;
  }): Promise<FileDTO> {
    const { files } = await this.fileUploadService.uploadFile({
      file,
      filename,
      mimeType,
      fileFolder: FileFolder.File,
      workspaceId,
    });

    if (!files.length) {
      throw new Error('Failed to upload file');
    }

    const createdFile = this.fileRepository.create({
      path: files[0].path,
      size: file.length,
      workspaceId,
    });

    const savedFile = await this.fileRepository.save(createdFile);

    return savedFile;
  }

  /**
   * @deprecated
   */
  async deleteFileById(
    id: string,
    workspaceId: string,
  ): Promise<FileDTO | null> {
    const file = await this.fileRepository.findOne({
      where: { id, workspaceId },
    });

    if (!file) {
      return null;
    }

    const { folderPath, filename } = extractFolderPathFilenameAndTypeOrThrow(
      file.path,
    );

    try {
      if (file.path) {
        await this.fileService.deleteFile({
          folderPath,
          filename,
          workspaceId,
        });
      }

      await this.fileRepository.delete(file.id);

      return file;
    } catch (error) {
      throw new Error(`Failed to delete file ${id}: ${error.message}`);
    }
  }
}
