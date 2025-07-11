import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

import { FileService } from './file.service';

@Injectable()
export class FileMetadataService {
  constructor(
    @InjectRepository(FileEntity, 'core')
    private readonly fileRepository: Repository<FileEntity>,
    private readonly fileService: FileService,
  ) {}

  async createFile(fileData: {
    name: string;
    fullPath: string;
    size: number;
    type: string;
    workspaceId: string;
  }): Promise<FileDTO> {
    const file = this.fileRepository.create(fileData);
    const savedFile = await this.fileRepository.save(file);

    return savedFile;
  }

  async deleteFileById(
    id: string,
    workspaceId: string,
  ): Promise<FileEntity | null> {
    const file = await this.fileRepository.findOne({
      where: { id, workspaceId },
    });

    if (!file) {
      return null;
    }

    try {
      const folderPath = file.fullPath.split('/').slice(0, -1).join('/');
      const filename = file.fullPath.split('/').pop();

      if (filename) {
        await this.fileService.deleteFile({
          workspaceId,
          filename,
          folderPath,
        });
      }

      await this.fileRepository.remove(file);

      return file;
    } catch (error) {
      throw new Error(`Failed to delete file ${id}: ${error.message}`);
    }
  }
}
