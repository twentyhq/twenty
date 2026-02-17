import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { FileWithSignedUrlDto } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import {
  FilesFieldException,
  FilesFieldExceptionCode,
} from 'src/engine/core-modules/file/files-field/files-field.exception';
import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Injectable()
export class FilesFieldService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async uploadFile({
    file,
    filename,
    workspaceId,
    fieldMetadataId,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
    fieldMetadataId: string;
  }): Promise<FileWithSignedUrlDto> {
    const { mimeType, ext } = await extractFileInfo({
      file,
      filename,
    });

    const sanitizedFile = sanitizeFile({ file, ext, mimeType });

    const fileId = v4();
    const name = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const fieldMetadata = await this.fieldMetadataRepository.findOneOrFail({
      select: ['applicationId', 'universalIdentifier'],
      where: {
        id: fieldMetadataId,
        workspaceId,
      },
    });

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        id: fieldMetadata.applicationId,
        workspaceId,
      },
    });

    const savedFile = await this.fileStorageService.writeFile({
      sourceFile: sanitizedFile,
      resourcePath: `${fieldMetadata.universalIdentifier}/${name}`,
      mimeType,
      fileFolder: FileFolder.FilesField,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
      fileId,
      settings: {
        isTemporaryFile: true,
        toDelete: false,
      },
    });

    return {
      ...savedFile,
      url: this.fileUrlService.signFileByIdUrl({
        fileId,
        workspaceId,
        fileFolder: FileFolder.FilesField,
      }),
    };
  }

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
        {
          userFriendlyMessage: msg`Failed to delete file ${fileId}`,
        },
      );
    }
  }
}
