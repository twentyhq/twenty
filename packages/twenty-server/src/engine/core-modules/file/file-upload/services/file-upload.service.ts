import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import bytes from 'bytes';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { settings } from 'src/engine/constants/settings';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { COMPLETE_FILE_UPLOAD_DEADLINE_MS } from 'src/engine/core-modules/file/file-upload/constants/complete-file-upload-deadline.constant';
import { MAX_SANITIZABLE_SVG_BYTES } from 'src/engine/core-modules/file/file-upload/constants/max-sanitizable-svg-size.constant';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUploadCompletionService } from 'src/engine/core-modules/file/file-upload/services/file-upload-completion.service';
import { FileUploadTargetService } from 'src/engine/core-modules/file/file-upload/services/file-upload-target.service';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
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
  ) {}

  async createFileUpload({
    workspaceId,
    filename,
    size,
    fileFolder,
    fieldMetadataId,
    fieldMetadataUniversalIdentifier,
  }: {
    workspaceId: string;
    filename: string;
    size: number;
    fileFolder: FileFolder;
    fieldMetadataId?: string;
    fieldMetadataUniversalIdentifier?: string;
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
    if (ext === 'svg' && size > MAX_SANITIZABLE_SVG_BYTES) {
      throw new FileUploadException(
        `SVG of ${size} bytes exceeds the ${MAX_SANITIZABLE_SVG_BYTES} bytes that can be sanitized`,
        FileUploadExceptionCode.FILE_TOO_LARGE,
        {
          userFriendlyMessage: msg`This SVG is too large to be processed.`,
        },
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
          resourcePath,
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
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<FileWithSignedUrlDTO> {
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
  }: {
    workspaceId: string;
    fileFolder: FileFolder;
    name: string;
    fieldMetadataId?: string;
    fieldMetadataUniversalIdentifier?: string;
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
  }): Promise<FileWithSignedUrlDTO> {
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
