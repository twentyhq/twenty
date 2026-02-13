import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';

@Injectable()
export class FileWorkflowService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async uploadFile({
    file,
    filename,
    workspaceId,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
  }): Promise<FileEntity> {
    const { mimeType, ext } = await extractFileInfo({
      file,
      filename,
    });

    const sanitizedFile = sanitizeFile({ file, ext, mimeType });

    const fileId = v4();
    const name = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;
    const fileFolder = FileFolder.Workflow;

    await this.fileStorageService.writeFileLegacy({
      file: sanitizedFile,
      name,
      mimeType,
      folder: `workspace-${workspaceId}/${fileFolder}`,
    });

    const createdFile = this.fileRepository.create({
      id: fileId,
      path: `${fileFolder}/${name}`,
      size: sanitizedFile.length,
      mimeType,
      workspaceId,
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    return await this.fileRepository.save(createdFile);
  }
}
