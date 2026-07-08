import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Readable, Transform } from 'stream';
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
import { FileUploadTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-upload-token-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileWithSignedUrlDTO } from 'src/engine/core-modules/file/dtos/file-with-sign-url.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_CONTENT_SNIFF_BYTE_COUNT } from 'src/engine/core-modules/file/file-upload/constants/file-content-sniff.constant';
import { FileUploadTargetDTO } from 'src/engine/core-modules/file/file-upload/dtos/file-upload-target.dto';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { FileUrlService } from 'src/engine/core-modules/file/file-url/file-url.service';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { readReadablePrefix } from 'src/utils/read-readable-prefix';

export const DIRECT_UPLOAD_FILE_FOLDERS = [
  FileFolder.FilesField,
  FileFolder.Workflow,
  FileFolder.EmailAttachment,
  FileFolder.AgentChat,
] as const;

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly fileUrlService: FileUrlService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
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

    const expiresInSeconds = this.twentyConfigService.get(
      'STORAGE_S3_PRESIGNED_URL_EXPIRES_IN',
    );
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    const presignedUploadUrl =
      await this.fileStorageService.getPresignedUploadUrl({
        fileFolder,
        applicationUniversalIdentifier,
        workspaceId,
        resourcePath,
        contentType: mimeType,
        contentLength: size,
        expiresInSeconds,
      });

    if (isDefined(presignedUploadUrl)) {
      return {
        fileId,
        uploadUrl: presignedUploadUrl,
        contentType: mimeType,
        expiresAt,
      };
    }

    // No presign support (local storage, or S3 without presign enabled):
    // fall back to the token-authenticated streaming endpoint on the server.
    const payload: FileUploadTokenJwtPayload = {
      workspaceId,
      fileId,
      sub: workspaceId,
      type: JwtTokenTypeEnum.FILE_UPLOAD,
    };

    const token = await this.jwtWrapperService.signAsyncOrThrow(payload, {
      expiresIn: expiresInSeconds,
    });

    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return {
      fileId,
      uploadUrl: `${serverUrl}/file-upload/${fileId}?token=${token}`,
      // octet-stream keeps the request body away from the server's json/text
      // body parsers; the real mime type is already on the file record.
      contentType: 'application/octet-stream',
      expiresAt,
    };
  }

  // Streams the request body straight to the storage driver, bounded by the
  // size declared at createFileUpload time. Memory usage stays constant no
  // matter how large the file is.
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
      // The storage-side pipeline can lose the rejection race to the limiter:
      // surface the size violation over the resulting stream teardown error.
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
      // The short object stays in storage but the record stays PENDING, so it
      // can never be served or attached: the client retries against the same
      // upload url (overwriting it), and the pending-file cleanup cron
      // (follow-up PR) reaps whatever is abandoned.
      throw new FileUploadException(
        `Uploaded ${receivedBytes} bytes but ${declaredSize} were declared`,
        FileUploadExceptionCode.FILE_SIZE_MISMATCH,
        {
          userFriendlyMessage: msg`The uploaded file does not match the declared size. Please retry the upload.`,
        },
      );
    }
  }

  // Verifies the bytes actually landed in storage with the declared size and
  // flips the file to UPLOADED. Idempotent: confirming twice is a no-op.
  async completeFileUpload({
    workspaceId,
    fileId,
  }: {
    workspaceId: string;
    fileId: string;
  }): Promise<FileWithSignedUrlDTO> {
    const file = await this.findFileOrThrow({ workspaceId, fileId });
    const [fileFolder] = file.path.split('/');

    // Restrict to files created through createFileUpload so this mutation
    // cannot be used to mint signed download urls for arbitrary files.
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
      // Idempotent retry of a confirm that already succeeded. Only files not
      // yet attached to a record qualify: this cannot be used to mint signed
      // urls for files that went through the legacy flow and got attached.
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

    const metadata = await this.fileStorageService.getFileMetadata({
      fileFolder: fileFolder as FileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
      resourcePath,
    });

    if (!isDefined(metadata)) {
      throw new FileUploadException(
        `File ${fileId} has not been uploaded to storage yet`,
        FileUploadExceptionCode.FILE_NOT_UPLOADED,
        {
          userFriendlyMessage: msg`The file has not been uploaded yet. Please upload it before confirming.`,
        },
      );
    }

    if (metadata.size !== Number(file.size)) {
      throw new FileUploadException(
        `File ${fileId} has ${metadata.size} bytes in storage but ${file.size} were declared`,
        FileUploadExceptionCode.FILE_SIZE_MISMATCH,
        {
          userFriendlyMessage: msg`The uploaded file does not match the declared size. Please retry the upload.`,
        },
      );
    }

    const mimeType = await this.detectUploadedMimeTypeOrThrow({
      fileFolder: fileFolder as FileFolder,
      applicationUniversalIdentifier: application.universalIdentifier,
      workspaceId,
      resourcePath,
      filename: file.path,
    });

    await this.fileRepository.update(
      workspaceId,
      { id: fileId },
      { status: FILE_STATUS.UPLOADED, mimeType },
    );

    return this.toFileWithSignedUrl({
      file: { ...file, status: FILE_STATUS.UPLOADED, mimeType },
      fileFolder: fileFolder as FileFolder,
      workspaceId,
    });
  }

  private async detectUploadedMimeTypeOrThrow({
    fileFolder,
    applicationUniversalIdentifier,
    workspaceId,
    resourcePath,
    filename,
  }: {
    fileFolder: FileFolder;
    applicationUniversalIdentifier: string;
    workspaceId: string;
    resourcePath: string;
    filename: string;
  }): Promise<string> {
    const stream = await this.fileStorageService.readFile({
      fileFolder,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath,
    });

    const prefix = await readReadablePrefix(
      stream,
      FILE_CONTENT_SNIFF_BYTE_COUNT,
    );

    const { mimeType } = await extractFileInfoOrThrow({
      file: prefix,
      filename,
    });

    return mimeType;
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
