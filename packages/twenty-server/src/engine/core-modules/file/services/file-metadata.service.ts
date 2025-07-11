import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

@Injectable()
export class FileMetadataService {
  constructor(
    @InjectRepository(FileEntity, 'core')
    private readonly fileRepository: Repository<FileEntity>,
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
}
