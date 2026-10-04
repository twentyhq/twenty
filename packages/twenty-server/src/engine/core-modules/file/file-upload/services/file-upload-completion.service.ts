import { Injectable, Logger } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { Readable } from 'stream';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { type FileStorageMetadata } from 'src/engine/core-modules/file-storage/types/file-storage-metadata.type';
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
import { buildSvgTooLargeException } from 'src/engine/core-modules/file/file-upload/utils/build-svg-too-large-exception.util';
import { toBatchErrorMessage } from 'src/engine/core-modules/file/file-upload/utils/to-batch-error-message.util';
import {
  ANY_MIME_TYPE,
  fileFolderConfigs,
} from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { removeFileFolderFromFileEntityPath } from 'src/engine/core-modules/file/utils/remove-file-folder-from-file-entity-path.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';
import {
  isMetadataStrippableImageMimeType,
  stripImageMetadata,
} from 'src/engine/core-modules/file/utils/strip-image-metadata.utils';
import { StreamSizeExceededError } from 'src/utils/stream-size-exceeded-error';
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
  private readonly logger = new Logger(FileUploadCompletionService.name);

  constructor(private readonly fileStorageService: FileStorageService) {}

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

    // Never fall back to the final path: a previous upload's object there would complete an upload that sent nothing.
    const metadata =
      await this.fileStorageService.getFileMetadata(pendingLocation);

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
      ...pendingLocation,
      filename: file.path,
    });

    this.assertMimeTypeAllowedForFolder(pendingLocation.fileFolder, mimeType);

    const { size, checksum } = await this.sanitizeUploadedFileIfNeeded({
      storageLocation: pendingLocation,
      mimeType,
      metadata,
    });

    // The presigned PUT can still overwrite quarantine after the sniff, so only the inspected version is promoted.
    await this.fileStorageService.move({
      from: pendingLocation,
      to: storageLocation,
      ifMatchChecksum: checksum,
    });

    const { affected } = await this.fileStorageService.markFileUploaded({
      workspaceId,
      applicationId: file.applicationId,
      fileId: file.id,
      chargedSize: declaredSize,
      size,
      mimeType,
    });

    // Losing the row means the cleanup cron reaped it; leak the promoted object rather than risk deleting a later upload.
    if (affected === 0) {
      this.logger.warn(
        `File ${file.id} was reaped while completing; the object promoted to "${file.path}" may be orphaned`,
      );

      throw new FileUploadException(
        `File ${file.id} was reaped while its upload was being completed`,
        FileUploadExceptionCode.FILE_NOT_FOUND,
        {
          userFriendlyMessage: msg`This upload expired before it was confirmed. Please upload the file again.`,
        },
      );
    }

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
    metadata,
  }: {
    storageLocation: FileUploadStorageLocation;
    mimeType: string;
    metadata: FileStorageMetadata;
  }): Promise<FileStorageMetadata> {
    const { size } = metadata;

    if (mimeType === 'image/svg+xml') {
      return this.sanitizeSvg({ storageLocation, mimeType, metadata });
    }

    if (isMetadataStrippableImageMimeType(mimeType)) {
      return this.stripImageMetadata({ storageLocation, mimeType, metadata });
    }

    return metadata;
  }

  private async sanitizeSvg({
    storageLocation,
    mimeType,
    metadata,
  }: {
    storageLocation: FileUploadStorageLocation;
    mimeType: string;
    metadata: FileStorageMetadata;
  }): Promise<FileStorageMetadata> {
    const { size } = metadata;

    if (size > MAX_SANITIZABLE_SVG_BYTES) {
      throw buildSvgTooLargeException(
        `storage reports ${size} bytes, above the ${MAX_SANITIZABLE_SVG_BYTES} byte limit`,
      );
    }

    const stream = await this.fileStorageService.readFile(storageLocation);

    let file: Buffer;

    try {
      file = await streamToBuffer(stream, MAX_SANITIZABLE_SVG_BYTES);
    } catch (error) {
      if (error instanceof StreamSizeExceededError) {
        // Storage understated `size`, so quoting it would contradict this failure.
        throw buildSvgTooLargeException(
          `content exceeds the ${MAX_SANITIZABLE_SVG_BYTES} byte limit`,
        );
      }

      throw error;
    }

    const sanitizedFile = sanitizeFile({
      file,
      ext: 'svg',
      mimeType,
    });

    const sanitizedBuffer = Buffer.isBuffer(sanitizedFile)
      ? sanitizedFile
      : Buffer.from(sanitizedFile);

    return this.rewriteSanitizedFile({
      storageLocation,
      mimeType,
      metadata,
      sanitizedBuffer,
    });
  }

  /**
   * Removes EXIF / GPS / XMP metadata from raster images.
   *
   * Uploaded photos routinely carry the device's GPS coordinates and capture
   * details. Leaving them in place leaks the uploader's location to anyone who
   * can download the file, so the metadata is stripped before the object is
   * promoted out of quarantine.
   */
  private async stripImageMetadata({
    storageLocation,
    mimeType,
    metadata,
  }: {
    storageLocation: FileUploadStorageLocation;
    mimeType: string;
    metadata: FileStorageMetadata;
  }): Promise<FileStorageMetadata> {
    const stream = await this.fileStorageService.readFile(storageLocation);

    let file: Buffer;

    try {
      file = await streamToBuffer(stream, metadata.size);
    } catch (error) {
      if (error instanceof StreamSizeExceededError) {
        throw new FileUploadException(
          `Image at "${storageLocation.resourcePath}" exceeds its declared size of ${metadata.size} bytes`,
          FileUploadExceptionCode.FILE_SIZE_MISMATCH,
          {
            userFriendlyMessage: msg`The uploaded file does not match the declared size. Please retry the upload.`,
          },
        );
      }

      throw error;
    }

    const strippedBuffer = stripImageMetadata(file);

    // Nothing to rewrite: the image carried no metadata we remove.
    if (strippedBuffer.length === file.length) {
      return metadata;
    }

    return this.rewriteSanitizedFile({
      storageLocation,
      mimeType,
      metadata,
      sanitizedBuffer: strippedBuffer,
    });
  }

  private async rewriteSanitizedFile({
    storageLocation,
    mimeType,
    metadata,
    sanitizedBuffer,
  }: {
    storageLocation: FileUploadStorageLocation;
    mimeType: string;
    metadata: FileStorageMetadata;
    sanitizedBuffer: Buffer;
  }): Promise<FileStorageMetadata> {
    await this.fileStorageService.writeFileStream({
      ...storageLocation,
      stream: Readable.from(sanitizedBuffer),
      mimeType,
    });

    // Rewriting the object invalidates the checksum read before it.
    const sanitizedMetadata =
      await this.fileStorageService.getFileMetadata(storageLocation);

    // A missing identity would silently downgrade the promoting copy to an unconditional one.
    if (
      !isDefined(sanitizedMetadata) ||
      (isDefined(metadata.checksum) && !isDefined(sanitizedMetadata.checksum))
    ) {
      throw new FileUploadException(
        `Could not read back the sanitized file at "${storageLocation.resourcePath}"`,
        FileUploadExceptionCode.STORAGE_INCONSISTENT,
        {
          userFriendlyMessage: msg`File storage did not confirm the processed file. Please retry.`,
        },
      );
    }

    return {
      size: sanitizedBuffer.length,
      checksum: sanitizedMetadata.checksum,
    };
  }
}
