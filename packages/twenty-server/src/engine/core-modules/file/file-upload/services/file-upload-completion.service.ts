import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { Readable } from 'stream';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileDTO } from 'src/engine/core-modules/file/dtos/file.dto';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_CONTENT_SNIFF_BYTE_COUNT } from 'src/engine/core-modules/file/file-upload/constants/file-content-sniff.constant';
import { MAX_SANITIZABLE_SVG_BYTES } from 'src/engine/core-modules/file/file-upload/constants/max-sanitizable-svg-size.constant';
import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import { type BatchFileResult } from 'src/engine/core-modules/file/file-upload/types/batch-file-result.type';
import { buildPendingUploadResourcePath } from 'src/engine/core-modules/file/file-upload/utils/build-pending-upload-resource-path.util';
import { toBatchErrorMessage } from 'src/engine/core-modules/file/file-upload/utils/to-batch-error-message.util';
import {
  ANY_MIME_TYPE,
  fileFolderConfigs,
} from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { streamToBuffer } from 'src/utils/stream-to-buffer';

export type BatchCompleteUploadRequest = {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  file: FileEntity;
};

export type FileUploadStorageLocation = {
  fileFolder: FileFolder;
  applicationUniversalIdentifier: string;
  workspaceId: string;
  resourcePath: string;
};

type CompletedUploadedFile = FileDTO & Pick<FileEntity, 'mimeType'>;

@Injectable()
export class FileUploadCompletionService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {}

  async completeUploadsBatch(
    requests: BatchCompleteUploadRequest[],
  ): Promise<BatchFileResult<FileDTO>[]> {
    return Promise.all(
      requests.map(async (request) => {
        try {
          const value = await this.completeUploadedFile({
            workspaceId: request.workspaceId,
            file: request.file,
            storageLocation: this.getApplicationFileStorageLocation(request),
          });

          return { success: true as const, value };
        } catch (error) {
          return { success: false as const, error: toBatchErrorMessage(error) };
        }
      }),
    );
  }

  async completeUploadedFile({
    workspaceId,
    file,
    storageLocation,
  }: {
    workspaceId: string;
    file: FileEntity;
    storageLocation: FileUploadStorageLocation;
  }): Promise<CompletedUploadedFile> {
    const pendingLocation: FileUploadStorageLocation = {
      ...storageLocation,
      resourcePath: buildPendingUploadResourcePath({
        fileId: file.id,
        resourcePath: storageLocation.resourcePath,
      }),
    };

    let sourceLocation = pendingLocation;
    let metadata =
      await this.fileStorageService.getFileMetadata(pendingLocation);

    if (!isDefined(metadata)) {
      // A retry after the object was moved but before the row was updated
      // finds nothing left in quarantine, so validate the final path instead.
      sourceLocation = storageLocation;
      metadata = await this.fileStorageService.getFileMetadata(storageLocation);
    }

    if (!isDefined(metadata)) {
      throw new FileUploadException(
        `File "${file.path}" has not been uploaded to storage yet.`,
        FileUploadExceptionCode.FILE_NOT_UPLOADED,
        {
          userFriendlyMessage: msg`The file has not been uploaded yet. Please upload it before confirming.`,
        },
      );
    }

    const declaredSize = Number(file.size);

    if (metadata.size !== declaredSize) {
      throw new FileUploadException(
        `File "${file.path}" has ${metadata.size} bytes in storage but ${declaredSize} were declared.`,
        FileUploadExceptionCode.FILE_SIZE_MISMATCH,
        {
          userFriendlyMessage: msg`The uploaded file does not match the declared size. Please retry the upload.`,
        },
      );
    }

    const mimeType = await this.detectUploadedMimeTypeOrThrow({
      ...sourceLocation,
      filename: file.path,
    });

    this.assertMimeTypeAllowedForFolder(sourceLocation.fileFolder, mimeType);

    const size = await this.sanitizeUploadedFileIfNeeded({
      storageLocation: sourceLocation,
      mimeType,
      size: metadata.size,
    });

    if (sourceLocation === pendingLocation) {
      await this.fileStorageService.move({
        from: pendingLocation,
        to: storageLocation,
      });
    }

    await this.fileRepository.update(
      workspaceId,
      { id: file.id },
      { status: FILE_STATUS.UPLOADED, mimeType, size },
    );

    return {
      id: file.id,
      path: file.path,
      size,
      createdAt: file.createdAt,
      mimeType,
    };
  }

  private getApplicationFileStorageLocation({
    workspaceId,
    applicationUniversalIdentifier,
    file,
  }: BatchCompleteUploadRequest): FileUploadStorageLocation {
    const [fileFolder] = file.path.split('/');

    return {
      fileFolder: fileFolder as FileFolder,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath: removeFileFolderFromFileEntityPath(file.path),
    };
  }

  private async detectUploadedMimeTypeOrThrow({
    fileFolder,
    applicationUniversalIdentifier,
    workspaceId,
    resourcePath,
    filename,
  }: FileUploadStorageLocation & { filename: string }): Promise<string> {
    const prefix = await this.fileStorageService.readFilePrefix({
      fileFolder,
      applicationUniversalIdentifier,
      workspaceId,
      resourcePath,
      byteCount: FILE_CONTENT_SNIFF_BYTE_COUNT,
    });

    const { mimeType } = await extractFileInfoOrThrow({
      file: prefix,
      filename,
    });

    return mimeType;
  }

  private assertMimeTypeAllowedForFolder(
    fileFolder: FileFolder,
    mimeType: string,
  ): void {
    const { allowedMimeTypes } = fileFolderConfigs[fileFolder];

    if (
      allowedMimeTypes === ANY_MIME_TYPE ||
      allowedMimeTypes.includes(mimeType)
    ) {
      return;
    }

    throw new FileUploadException(
      `MIME type ${mimeType} is not allowed in file folder ${fileFolder}`,
      FileUploadExceptionCode.BAD_REQUEST,
      {
        userFriendlyMessage: msg`This file format is not supported.`,
      },
    );
  }

  private async sanitizeUploadedFileIfNeeded({
    storageLocation,
    mimeType,
    size,
  }: {
    storageLocation: FileUploadStorageLocation;
    mimeType: string;
    size: number;
  }): Promise<number> {
    if (mimeType !== 'image/svg+xml') {
      return size;
    }

    if (size > MAX_SANITIZABLE_SVG_BYTES) {
      throw new FileUploadException(
        `SVG of ${size} bytes exceeds the ${MAX_SANITIZABLE_SVG_BYTES} bytes that can be sanitized`,
        FileUploadExceptionCode.FILE_TOO_LARGE,
        {
          userFriendlyMessage: msg`This SVG is too large to be processed.`,
        },
      );
    }

    const stream = await this.fileStorageService.readFile(storageLocation);
    const sanitizedFile = sanitizeFile({
      file: await streamToBuffer(stream, MAX_SANITIZABLE_SVG_BYTES),
      ext: 'svg',
      mimeType,
    });

    const sanitizedBuffer = Buffer.isBuffer(sanitizedFile)
      ? sanitizedFile
      : Buffer.from(sanitizedFile);

    await this.fileStorageService.writeFileStream({
      ...storageLocation,
      stream: Readable.from(sanitizedBuffer),
      mimeType,
    });

    return sanitizedBuffer.length;
  }
}
