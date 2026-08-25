import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { extname } from 'path';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILES_FIELD_COPYABLE_SOURCE_FOLDERS } from 'src/engine/core-modules/file/files-field/constants/files-field-copyable-source-folders.constant';
import {
  FilesFieldException,
  FilesFieldExceptionCode,
} from 'src/engine/core-modules/file/files-field/files-field.exception';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class FilesFieldService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly fileUrlService: FileUrlService,
  ) {}

  async uploadFile({
    file,
    filename,
    workspaceId,
    fieldMetadataId,
    fieldMetadataUniversalIdentifier,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
    fieldMetadataId?: string;
    fieldMetadataUniversalIdentifier?: string;
  }): Promise<FileWithSignedUrlDTO> {
    if (!fieldMetadataId && !fieldMetadataUniversalIdentifier) {
      throw new FilesFieldException(
        'fieldMetadataId or fieldMetadataUniversalIdentifier must be provided',
        FilesFieldExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`fieldMetadataId or fieldMetadataUniversalIdentifier must be provided`,
        },
      );
    }

    const { ext } = await extractFileInfoOrThrow({
      file,
      filename,
    });

    const fileId = v4();
    const name = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const fieldMetadata = await this.fieldMetadataRepository.findOneOrFail({
      select: ['applicationId', 'universalIdentifier'],
      where: {
        ...(fieldMetadataId ? { id: fieldMetadataId } : {}),
        ...(fieldMetadataUniversalIdentifier
          ? { universalIdentifier: fieldMetadataUniversalIdentifier }
          : {}),
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
      sourceFile: file,
      resourcePath: `${fieldMetadata.universalIdentifier}/${name}`,
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
      url: await this.fileUrlService.signFileByIdUrl({
        fileId,
        workspaceId,
        fileFolder: FileFolder.FilesField,
      }),
    };
  }

  // FILES field values may only reference files stored under
  // files-field/<fieldUniversalIdentifier>/, so a file uploaded elsewhere
  // (an AI chat upload) has to be copied into that partition first.
  async copyFileIntoFilesField({
    fileId,
    workspaceId,
    fieldMetadataId,
  }: {
    fileId: string;
    workspaceId: string;
    fieldMetadataId: string;
  }): Promise<FileEntity> {
    const sourceFile = await this.fileRepository.findOne(workspaceId, {
      where: { id: fileId },
    });

    if (!isDefined(sourceFile)) {
      throw new FilesFieldException(
        `File ${fileId} not found`,
        FilesFieldExceptionCode.BAD_REQUEST,
        { userFriendlyMessage: msg`File ${fileId} not found` },
      );
    }

    if (sourceFile.status !== FILE_STATUS.UPLOADED) {
      throw new FilesFieldException(
        `File ${fileId} upload has not been completed`,
        FilesFieldExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`File ${fileId} upload has not been completed. Please retry the upload.`,
        },
      );
    }

    const sourceFolder = FILES_FIELD_COPYABLE_SOURCE_FOLDERS.find((folder) =>
      sourceFile.path.startsWith(`${folder}/`),
    );

    if (!isDefined(sourceFolder)) {
      throw new FilesFieldException(
        `File ${fileId} cannot be copied into a files field`,
        FilesFieldExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`File ${fileId} cannot be attached to a record.`,
        },
      );
    }

    const fieldMetadata = await this.fieldMetadataRepository.findOneOrFail({
      select: ['applicationId', 'universalIdentifier'],
      where: { id: fieldMetadataId, workspaceId },
    });

    const [sourceApplication, destinationApplication] = await Promise.all([
      this.applicationRepository.findOneOrFail({
        select: ['universalIdentifier'],
        where: { id: sourceFile.applicationId, workspaceId },
      }),
      this.applicationRepository.findOneOrFail({
        select: ['universalIdentifier'],
        where: { id: fieldMetadata.applicationId, workspaceId },
      }),
    ]);

    const copiedFileId = v4();
    const extension = extname(sourceFile.path);

    return this.fileStorageService.copyFile({
      from: {
        workspaceId,
        applicationUniversalIdentifier: sourceApplication.universalIdentifier,
        fileFolder: sourceFolder,
        resourcePath: removeFileFolderFromFileEntityPath(sourceFile.path),
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier:
          destinationApplication.universalIdentifier,
        fileFolder: FileFolder.FilesField,
        resourcePath: `${fieldMetadata.universalIdentifier}/${copiedFileId}${extension}`,
      },
      fileId: copiedFileId,
      mimeType: sourceFile.mimeType,
      size: sourceFile.size,
      settings: {
        isTemporaryFile: true,
        toDelete: false,
      },
    });
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
