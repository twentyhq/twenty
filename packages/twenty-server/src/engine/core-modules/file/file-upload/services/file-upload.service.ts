import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import bytes from 'bytes';
import { FieldMetadataType, FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { settings } from 'src/engine/constants/settings';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { COMPLETE_FILE_UPLOAD_DEADLINE_MS } from 'src/engine/core-modules/file/file-upload/constants/complete-file-upload-deadline.constant';
import { MAX_SANITIZABLE_SVG_BYTES } from 'src/engine/core-modules/file/file-upload/constants/max-sanitizable-svg-size.constant';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import { type CompletedFileUpload } from 'src/engine/core-modules/file/file-upload/types/completed-file-upload.type';
import { type FileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/types/file-upload-principal.type';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadCompletionService } from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FileUploadTargetService } from 'src/engine/core-modules/file/file-upload/services/file-upload-target.service';
import { buildSvgTooLargeException } from 'src/engine/core-modules/file/file-upload/utils/build-svg-too-large-exception.util';
import { isSameFileUploadPrincipal } from 'src/engine/core-modules/file/file-upload/utils/is-same-file-upload-principal.util';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { withDeadline } from 'src/utils/with-deadline';

export const DIRECT_UPLOAD_FILE_FOLDERS = [
  FileFolder.FilesField,
  FileFolder.Workflow,
  FileFolder.EmailAttachment,
  FileFolder.AgentChat,
  FileFolder.EmailImage,
] as const;

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly fileUrlService: FileUrlService,
    private readonly fileUploadTargetService: FileUploadTargetService,
    private readonly fileUploadCompletionService: FileUploadCompletionService,
    private readonly applicationService: ApplicationService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
    private readonly permissionsService: PermissionsService,
  ) {}

  async createFileUpload({
    workspaceId,
    filename,
    size,
    fileFolder,
    fieldMetadataId,
    fieldMetadataUniversalIdentifier,
    principal,
  }: {
    workspaceId: string;
    filename: string;
    size: number;
    fileFolder: FileFolder;
    fieldMetadataId?: string;
    fieldMetadataUniversalIdentifier?: string;
    principal: FileUploadPrincipal;
  }): Promise<FileUploadTargetDTO> {
    if (
      !DIRECT_UPLOAD_FILE_FOLDERS.includes(
        fileFolder as (typeof DIRECT_UPLOAD_FILE_FOLDERS)[number],
      )
    ) {
      throw new FileUploadException(
        `Direct upload is not supported for file folder ${fileFolder}`,
        FileUploadExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`Direct upload is not supported for this file type.`,
        },
      );
    }

    const maxFileSize = bytes(settings.storage.maxDirectUploadFileSize) ?? 0;

    if (!Number.isInteger(size) || size <= 0 || size > maxFileSize) {
      throw new FileUploadException(
        `Invalid file size ${size} (max ${maxFileSize} bytes)`,
        FileUploadExceptionCode.FILE_TOO_LARGE,
        {
          userFriendlyMessage: msg`The file is empty or exceeds the maximum allowed size.`,
        },
      );
    }

    const { ext } = buildFileInfo(filename);

    // Completion refuses to sanitize an SVG this big, so reject before the
    // client transfers it. The declared extension is a client claim, which
    // only makes this a shortcut: the sniffed check at completion decides.
    if (ext.toLowerCase() === 'svg' && size > MAX_SANITIZABLE_SVG_BYTES) {
      throw buildSvgTooLargeException(
        `declared size ${size} exceeds the ${MAX_SANITIZABLE_SVG_BYTES} byte limit`,
      );
    }

    const mimeType = 'application/octet-stream';

    const fileId = v4();
    const name = `${fileId}${isNonEmptyString(ext) ? `.${ext}` : ''}`;

    const { applicationUniversalIdentifier, resourcePath } =
      await this.resolveUploadLocation({
        workspaceId,
        fileFolder,
        name,
        fieldMetadataId,
        fieldMetadataUniversalIdentifier,
        principal,
      });

    await this.fileStorageService.createPendingFile({
      fileFolder,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath,
      fileId,
      size,
      mimeType,
      settings: {
        isTemporaryFile: true,
        toDelete: false,
        uploadPrincipal: principal,
      },
    });

    return this.fileUploadTargetService.buildUploadTarget({
      workspaceId,
      fileId,
      fileFolder,
      applicationUniversalIdentifier,
      resourcePath,
      contentType: mimeType,
      size,
    });
  }

  async receiveFileStream({
    workspaceId,
    fileId,
    stream,
  }: {
    workspaceId: string;
    fileId: string;
    stream: Readable;
  }): Promise<void> {
    const file = await this.findFileOrThrow({ workspaceId, fileId });

    if (file.status !== FILE_STATUS.PENDING) {
      throw new FileUploadException(
        `File ${fileId} is not awaiting an upload`,
        FileUploadExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`This file has already been uploaded.`,
        },
      );
    }

    const { application, fileFolder, resourcePath } =
      await this.resolveFileLocation({ workspaceId, file });

    const declaredSize = Number(file.size);
    let receivedBytes = 0;

    const sizeLimiter = new Transform({
      transform: (chunk: Buffer, _encoding, callback) => {
        receivedBytes += chunk.length;

        if (receivedBytes > declaredSize) {
          callback(
            new FileUploadException(
              `Upload exceeds declared size of ${declaredSize} bytes`,
              FileUploadExceptionCode.FILE_TOO_LARGE,
              {
                userFriendlyMessage: msg`The uploaded file is larger than declared.`,
              },
            ),
          );

          return;
        }

        callback(null, chunk);
      },
    });

    try {
      await Promise.all([
        pipeline(stream, sizeLimiter),
        this.fileStorageService.writeFileStream({
          fileFolder,
          applicationUniversalIdentifier: application.universalIdentifier,
          workspaceId,
          resourcePath: buildPendingUploadResourcePath({
            fileId,
            resourcePath,
          }),
          stream: sizeLimiter,
          mimeType: file.mimeType,
        }),
      ]);
    } catch (error) {
      if (receivedBytes > declaredSize) {
        throw new FileUploadException(
          `Upload exceeds declared size of ${declaredSize} bytes`,
          FileUploadExceptionCode.FILE_TOO_LARGE,
          {
            userFriendlyMessage: msg`The uploaded file is larger than declared.`,
          },
        );
      }

      throw error;
    }

    if (receivedBytes !== declaredSize) {
      throw new FileUploadException(
        `Uploaded ${receivedBytes} bytes but ${declaredSize} were declared`,
        FileUploadExceptionCode.FILE_SIZE_MISMATCH,
        {
          userFriendlyMessage: msg`The uploaded file does not match the declared size. Please retry the upload.`,
        },
      );
    }
  }

  async completeFileUpload({
    workspaceId,
    fileId,
    principal,
  }: {
    workspaceId: string;
    fileId: string;
    principal: FileUploadPrincipal;
  }): Promise<CompletedFileUpload> {
    const file = await this.findFileOrThrow({ workspaceId, fileId });
    const [fileFolder] = file.path.split('/');

    if (
      !DIRECT_UPLOAD_FILE_FOLDERS.includes(
        fileFolder as (typeof DIRECT_UPLOAD_FILE_FOLDERS)[number],
      )
    ) {
      throw new FileUploadException(
        `File not found: ${fileId}`,
        FileUploadExceptionCode.FILE_NOT_FOUND,
        {
          userFriendlyMessage: msg`File not found.`,
        },
      );
    }

    this.assertPrincipalInitiatedUploadOrThrow({ file, principal });

    if (file.status === FILE_STATUS.UPLOADED) {
      if (!file.settings?.isTemporaryFile) {
        throw new FileUploadException(
          `File ${fileId} is not awaiting an upload confirmation`,
          FileUploadExceptionCode.BAD_REQUEST,
          {
            userFriendlyMessage: msg`This file upload has already been finalized.`,
          },
        );
      }

      return this.toFileWithSignedUrl({
        file,
        fileFolder: fileFolder as FileFolder,
        workspaceId,
      });
    }

    const { application, resourcePath } = await this.resolveFileLocation({
      workspaceId,
      file,
    });

    const completedFile = await withDeadline({
      promise: this.fileUploadCompletionService.completeUploadedFile({
        workspaceId,
        file,
        storageLocation: {
          fileFolder: fileFolder as FileFolder,
          applicationUniversalIdentifier: application.universalIdentifier,
          workspaceId,
          resourcePath,
        },
      }),
      timeoutMs: COMPLETE_FILE_UPLOAD_DEADLINE_MS,
      createTimeoutError: () =>
        new FileUploadException(
          `Completion of file ${fileId} exceeded ${COMPLETE_FILE_UPLOAD_DEADLINE_MS}ms waiting on storage`,
          FileUploadExceptionCode.STORAGE_TIMEOUT,
          {
            userFriendlyMessage: msg`File storage took too long to respond. Please retry.`,
          },
        ),
      onSettleAfterDeadline: (settlement) => {
        this.logger.warn(
          settlement.status === 'fulfilled'
            ? `Completion of file ${fileId} succeeded after the deadline had been reported to the client`
            : `Completion of file ${fileId} failed after the deadline had been reported to the client: ${settlement.error}`,
        );
      },
    });

    return this.toFileWithSignedUrl({
      file: { ...file, ...completedFile, status: FILE_STATUS.UPLOADED },
      fileFolder: fileFolder as FileFolder,
      workspaceId,
    });
  }

  private async resolveUploadLocation({
    workspaceId,
    fileFolder,
    name,
    fieldMetadataId,
    fieldMetadataUniversalIdentifier,
    principal,
  }: {
    workspaceId: string;
    fileFolder: FileFolder;
    name: string;
    fieldMetadataId?: string;
    fieldMetadataUniversalIdentifier?: string;
    principal: FileUploadPrincipal;
  }): Promise<{
    applicationUniversalIdentifier: string;
    resourcePath: string;
  }> {
    if (fileFolder === FileFolder.FilesField) {
      if (!fieldMetadataId && !fieldMetadataUniversalIdentifier) {
        throw new FileUploadException(
          'fieldMetadataId or fieldMetadataUniversalIdentifier must be provided',
          FileUploadExceptionCode.BAD_REQUEST,
          {
            userFriendlyMessage: msg`fieldMetadataId or fieldMetadataUniversalIdentifier must be provided`,
          },
        );
      }

      const fieldMetadata = await this.findFilesFieldMetadataOrThrow({
        workspaceId,
        fieldMetadataId,
        fieldMetadataUniversalIdentifier,
      });

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

      return {
        applicationUniversalIdentifier: application.universalIdentifier,
        resourcePath: `${fieldMetadata.universalIdentifier}/${name}`,
      };
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    return {
      applicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
      resourcePath: name,
    };
  }

  private async findFilesFieldMetadataOrThrow({
    workspaceId,
    fieldMetadataId,
    fieldMetadataUniversalIdentifier,
  }: {
    workspaceId: string;
    fieldMetadataId?: string;
    fieldMetadataUniversalIdentifier?: string;
  }): Promise<FieldMetadataEntity> {
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

    if (!isDefined(fieldMetadata)) {
      throw new FileUploadException(
        `Files field ${fieldMetadataId ?? fieldMetadataUniversalIdentifier} not found`,
        FileUploadExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`The target files field could not be found.`,
        },
      );
    }

    if (fieldMetadata.type !== FieldMetadataType.FILES) {
      throw new FileUploadException(
        `Field ${fieldMetadata.id} is not a files field`,
        FileUploadExceptionCode.BAD_REQUEST,
        {
          userFriendlyMessage: msg`Files can only be uploaded into a files field.`,
        },
      );
    }

    return fieldMetadata;
  }

  private async assertApplicationPrincipalCanUpdateFieldOrThrow({
    workspaceId,
    fieldMetadata,
    principal,
  }: {
    workspaceId: string;
    fieldMetadata: Pick<FieldMetadataEntity, 'id' | 'objectMetadataId'>;
    principal: FileUploadPrincipal;
  }): Promise<void> {
    if (!isDefined(principal.applicationId)) {
      return;
    }

    const canUpdateField =
      await this.permissionsService.principalCanUpdateField({
        workspaceId,
        objectMetadataId: fieldMetadata.objectMetadataId,
        fieldMetadataId: fieldMetadata.id,
        userWorkspaceId: principal.userWorkspaceId,
        applicationId: principal.applicationId,
      });

    if (canUpdateField) {
      return;
    }

    throw new PermissionsException(
      `Application ${principal.applicationId} cannot update records of the object owning field ${fieldMetadata.id}`,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  // A pending row is confirmable by any UPLOAD_FILE holder who knows its id,
  // so only the principal that initiated the upload may complete it.
  private assertPrincipalInitiatedUploadOrThrow({
    file,
    principal,
  }: {
    file: FileEntity;
    principal: FileUploadPrincipal;
  }): void {
    const uploadPrincipal = file.settings?.uploadPrincipal;

    if (
      !isDefined(uploadPrincipal) ||
      isSameFileUploadPrincipal(uploadPrincipal, principal)
    ) {
      return;
    }

    throw new PermissionsException(
      `Principal completing file ${file.id} differs from the one that initiated its upload`,
      PermissionsExceptionCode.PERMISSION_DENIED,
    );
  }

  private async findFileOrThrow({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<FileEntity> {
    const file = await this.fileRepository.findOne(workspaceId, {
      where: { id: fileId },
    });

    if (!isDefined(file)) {
      throw new FileUploadException(
        `File not found: ${fileId}`,
        FileUploadExceptionCode.FILE_NOT_FOUND,
        {
          userFriendlyMessage: msg`File not found.`,
        },
      );
    }

    return file;
  }

  private async resolveFileLocation({
    workspaceId,
    file,
  }: {
    workspaceId: string;
    file: FileEntity;
  }): Promise<{
    application: ApplicationEntity;
    fileFolder: FileFolder;
    resourcePath: string;
  }> {
    const [fileFolder] = file.path.split('/');

    const application = await this.applicationRepository.findOneOrFail({
      where: {
        id: file.applicationId,
        workspaceId,
      },
    });

    return {
      application,
      fileFolder: fileFolder as FileFolder,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    };
  }

  private async toFileWithSignedUrl({
    file,
    fileFolder,
    workspaceId,
  }: {
    file: FileEntity;
    fileFolder: FileFolder;
    workspaceId: string;
  }): Promise<CompletedFileUpload> {
    return {
      ...file,
      url: await this.fileUrlService.signFileByIdUrl({
        fileId: file.id,
        workspaceId,
        fileFolder,
      }),
    };
  }
}
