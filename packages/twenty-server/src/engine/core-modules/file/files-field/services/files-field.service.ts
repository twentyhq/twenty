import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { extname } from 'path';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import {
  FilesFieldException,
  FilesFieldExceptionCode,
} from 'src/engine/core-modules/file/files-field/files-field.exception';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
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
    private readonly permissionsService: PermissionsService,
  ) {}

  async uploadFile({
    file,
    filename,
    workspaceId,
    fieldMetadataId,
    fieldMetadataUniversalIdentifier,
    principal,
  }: {
    file: Buffer;
    filename: string;
    workspaceId: string;
    fieldMetadataId?: string;
    fieldMetadataUniversalIdentifier?: string;
    principal?: FileUploadPrincipal;
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

    const fieldMetadata = await this.fieldMetadataRepository.findOne({
      select: [
        'id',
        'applicationId',
        'universalIdentifier',
        'type',
        'objectMetadataId',
      ],
      where: {
        ...(fieldMetadataId ? { id: fieldMetadataId } : {}),
        ...(fieldMetadataUniversalIdentifier
          ? { universalIdentifier: fieldMetadataUniversalIdentifier }
          : {}),
        workspaceId,
      },
    });

    if (
      !isDefined(fieldMetadata) ||
      fieldMetadata.type !== FieldMetadataType.FILES
    ) {
      throw new FilesFieldException(
        `Files field ${fieldMetadataId ?? fieldMetadataUniversalIdentifier} not found`,
        FilesFieldExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`The target files field could not be found.`,
        },
      );
    }

    await this.assertApplicationPrincipalCanUpdateFieldOrThrow({
      workspaceId,
      fieldMetadata,
      principal,
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

  private async assertApplicationPrincipalCanUpdateFieldOrThrow({
    workspaceId,
    fieldMetadata,
    principal,
  }: {
    workspaceId: string;
    fieldMetadata: Pick<FieldMetadataEntity, 'id' | 'objectMetadataId'>;
    principal: FileUploadPrincipal | undefined;
  }): Promise<void> {
    const applicationId = principal?.applicationId;

    if (!isDefined(applicationId)) {
      return;
    }

    const canUpdateField =
      await this.permissionsService.principalCanUpdateField({
        workspaceId,
        objectMetadataId: fieldMetadata.objectMetadataId,
        fieldMetadataId: fieldMetadata.id,
        userWorkspaceId: principal?.userWorkspaceId ?? null,
        applicationId,
      });

    if (canUpdateField) {
      return;
    }

    throw new PermissionsException(
      `Application ${applicationId} cannot update records of the object owning field ${fieldMetadata.id}`,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

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
        { userFriendlyMessage: msg`File not found.` },
      );
    }

    if (sourceFile.status !== FILE_STATUS.UPLOADED) {
      throw new FilesFieldException(
        `File ${fileId} upload has not been completed`,
        FilesFieldExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`The file upload has not been completed. Please retry the upload.`,
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
    const resourcePath = `${fieldMetadata.universalIdentifier}/${copiedFileId}${extension}`;
    const sourceFileFolder = sourceFile.path.split('/')[0] as FileFolder;

    return this.fileStorageService.copyFile({
      from: {
        workspaceId,
        applicationUniversalIdentifier: sourceApplication.universalIdentifier,
        fileFolder: sourceFileFolder,
        resourcePath: removeFileFolderFromFileEntityPath(sourceFile.path),
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier:
          destinationApplication.universalIdentifier,
        fileFolder: FileFolder.FilesField,
        resourcePath,
      },
      fileId: copiedFileId,
      applicationId: fieldMetadata.applicationId,
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
