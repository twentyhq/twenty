import { Logger } from '@nestjs/common';

import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { type Readable } from 'stream';
import { pipeline } from 'stream/promises';

import {
  ApiError,
  type Bucket,
  type File,
  Storage,
} from '@google-cloud/storage';
import { isDefined } from 'twenty-shared/utils';

import { type StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import { type FileStorageMetadata } from 'src/engine/core-modules/file-storage/types/file-storage-metadata.type';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type ByteRange } from 'src/engine/core-modules/file-storage/types/byte-range.type';

export type GcsDriverOptions = {
  bucketName: string;
  projectId?: string;
  presignEnabled?: boolean;
};

const DEFAULT_PRESIGNED_URL_EXPIRES_IN_SECONDS = 900;

const isApiErrorWithStatus = (error: unknown, statusCode: number): boolean =>
  error instanceof ApiError && error.code === statusCode;

const buildFileNotFoundException = () =>
  new FileStorageException(
    'File not found',
    FileStorageExceptionCode.FILE_NOT_FOUND,
  );

export class GcsDriver implements StorageDriver {
  private readonly bucket: Bucket;
  private readonly presignEnabled: boolean;
  private readonly logger = new Logger(GcsDriver.name);

  constructor(options: GcsDriverOptions) {
    const storage = new Storage({ projectId: options.projectId });

    this.bucket = storage.bucket(options.bucketName);
    this.presignEnabled = options.presignEnabled ?? false;
  }

  async readFile(params: {
    filePath: string;
    byteRange?: ByteRange;
  }): Promise<Readable> {
    const stream = this.bucket
      .file(params.filePath)
      .createReadStream(
        isDefined(params.byteRange)
          ? { start: params.byteRange.startByte, end: params.byteRange.endByte }
          : undefined,
      );

    await this.waitForSuccessfulResponseOrThrow(stream);

    return stream;
  }

  // The request only starts once the stream is read, but callers expect FILE_NOT_FOUND before they consume it.
  private async waitForSuccessfulResponseOrThrow(
    stream: Readable,
  ): Promise<void> {
    // Keeps a later error from crashing the process before the caller attaches its own listener.
    stream.on('error', () => {});

    await new Promise<void>((resolve, reject) => {
      stream.once('response', (response: { statusCode?: number }) => {
        if (isDefined(response.statusCode) && response.statusCode < 400) {
          resolve();
        }
      });
      stream.once('error', (error) => {
        reject(
          isApiErrorWithStatus(error, 404)
            ? buildFileNotFoundException()
            : error,
        );
      });
      stream.read(0);
    });
  }

  async readFilePrefix(params: {
    filePath: string;
    byteCount: number;
  }): Promise<Buffer> {
    try {
      const [content] = await this.bucket
        .file(params.filePath)
        .download({ start: 0, end: params.byteCount - 1 });

      return content;
    } catch (error) {
      if (isApiErrorWithStatus(error, 404)) {
        throw buildFileNotFoundException();
      }

      // GCS refuses any range on an empty object.
      if (isApiErrorWithStatus(error, 416)) {
        return Buffer.alloc(0);
      }

      throw error;
    }
  }

  async writeFile(params: {
    filePath: string;
    sourceFile: Buffer | Uint8Array | string;
    mimeType: string | undefined;
  }): Promise<void> {
    await this.bucket.file(params.filePath).save(params.sourceFile, {
      contentType: params.mimeType,
      resumable: false,
    });
  }

  async writeFileStream(params: {
    filePath: string;
    stream: Readable;
    mimeType: string | undefined;
  }): Promise<void> {
    await pipeline(
      params.stream,
      this.bucket
        .file(params.filePath)
        .createWriteStream({ contentType: params.mimeType }),
    );
  }

  async getFileMetadata(params: {
    filePath: string;
  }): Promise<FileStorageMetadata | null> {
    try {
      const [metadata] = await this.bucket.file(params.filePath).getMetadata();

      return {
        size: Number(metadata.size ?? 0),
        checksum: isDefined(metadata.generation)
          ? String(metadata.generation)
          : undefined,
      };
    } catch (error) {
      if (isApiErrorWithStatus(error, 404)) {
        return null;
      }

      throw error;
    }
  }

  async downloadFile(params: {
    onStoragePath: string;
    localPath: string;
  }): Promise<void> {
    await mkdir(dirname(params.localPath), { recursive: true });

    const fileStream = await this.readFile({
      filePath: params.onStoragePath,
    });

    await pipeline(fileStream, createWriteStream(params.localPath));
  }

  async delete(params: {
    folderPath: string;
    filename?: string;
  }): Promise<void> {
    if (params.filename) {
      await this.bucket
        .file(`${params.folderPath}/${params.filename}`)
        .delete({ ignoreNotFound: true });

      return;
    }

    await this.bucket.deleteFiles({
      prefix: this.toFolderPrefix(params.folderPath),
    });
  }

  async move(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
    ifMatchChecksum?: string;
  }): Promise<void> {
    if (!params.from.filename || !params.to.filename) {
      await this.transferFolder({ ...params, deleteSource: true });

      return;
    }

    const fromKey = `${params.from.folderPath}/${params.from.filename}`;
    const toKey = `${params.to.folderPath}/${params.to.filename}`;

    if (isDefined(params.ifMatchChecksum)) {
      await this.movePreconditionedOnGeneration({
        fromKey,
        toKey,
        generation: params.ifMatchChecksum,
      });

      return;
    }

    await this.copyObjectOrThrow({ fromKey, toKey });
    await this.bucket.file(fromKey).delete({ ignoreNotFound: true });
  }

  // Copying the pinned generation promotes exactly the inspected bytes, even if the source is overwritten mid-copy.
  private async movePreconditionedOnGeneration({
    fromKey,
    toKey,
    generation,
  }: {
    fromKey: string;
    toKey: string;
    generation: string;
  }): Promise<void> {
    try {
      await this.bucket
        .file(fromKey, { generation })
        .copy(this.bucket.file(toKey));
    } catch (error) {
      if (!isApiErrorWithStatus(error, 404)) {
        throw error;
      }

      const currentMetadata = await this.getFileMetadata({ filePath: fromKey });

      if (!isDefined(currentMetadata)) {
        throw buildFileNotFoundException();
      }

      throw new FileStorageException(
        `Object at ${fromKey} changed since it was inspected`,
        FileStorageExceptionCode.PRECONDITION_FAILED,
      );
    }

    try {
      await this.bucket
        .file(fromKey)
        .delete({ ifGenerationMatch: generation, ignoreNotFound: true });
    } catch (error) {
      if (!isApiErrorWithStatus(error, 412)) {
        throw error;
      }

      // A newer write landed on the source after the copy; it stays unpromoted for the pending-file sweep.
      this.logger.warn(
        `Kept ${fromKey} after promoting it: it was overwritten during the move`,
      );
    }
  }

  async copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    if (!params.from.filename && params.to.filename) {
      throw new Error('Cannot copy folder to file');
    }

    if (!params.from.filename || !params.to.filename) {
      await this.transferFolder({ ...params, deleteSource: false });

      return;
    }

    await this.copyObjectOrThrow({
      fromKey: `${params.from.folderPath}/${params.from.filename}`,
      toKey: `${params.to.folderPath}/${params.to.filename}`,
    });
  }

  async checkFileExists(params: { filePath: string }): Promise<boolean> {
    const [exists] = await this.bucket.file(params.filePath).exists();

    return exists;
  }

  async checkFolderExists(params: { folderPath: string }): Promise<boolean> {
    const [files] = await this.bucket.getFiles({
      prefix: this.toFolderPrefix(params.folderPath),
      maxResults: 1,
      autoPaginate: false,
    });

    return files.length > 0;
  }

  async getPresignedUrl(params: {
    filePath: string;
    expiresInSeconds?: number;
    responseContentType?: string;
    responseContentDisposition?: string;
    responseCacheControl?: string;
  }): Promise<string | null> {
    if (!this.presignEnabled) {
      return null;
    }

    const file = this.bucket.file(params.filePath);

    // Without the requested Cache-Control the caller must serve the file itself rather than risk wrong caching.
    if (
      isDefined(params.responseCacheControl) &&
      !(await this.applyCacheControl(file, params.responseCacheControl))
    ) {
      return null;
    }

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: this.computeExpiry(params.expiresInSeconds),
      responseType: params.responseContentType,
      responseDisposition: params.responseContentDisposition,
    });

    return url;
  }

  async getPresignedUploadUrl(params: {
    filePath: string;
    contentType: string;
    contentLength: number;
    expiresInSeconds?: number;
  }): Promise<string | null> {
    if (!this.presignEnabled) {
      return null;
    }

    // Signed so the client cannot upload a different type or size than declared.
    const [url] = await this.bucket.file(params.filePath).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: this.computeExpiry(params.expiresInSeconds),
      contentType: params.contentType,
      extensionHeaders: { 'content-length': params.contentLength },
    });

    return url;
  }

  // GCS signed URLs cannot override Cache-Control per response, so it is stored on the object, where downloads read it.
  private async applyCacheControl(
    file: File,
    cacheControl: string,
  ): Promise<boolean> {
    try {
      const [metadata] = await file.getMetadata();

      if (metadata.cacheControl === cacheControl) {
        return true;
      }

      await file.setMetadata(
        { cacheControl },
        { ifMetagenerationMatch: metadata.metageneration },
      );

      return true;
    } catch (error) {
      // 412 and 429 come from concurrent metadata updates, which GCS caps at one per second per object.
      if (
        isApiErrorWithStatus(error, 404) ||
        isApiErrorWithStatus(error, 412) ||
        isApiErrorWithStatus(error, 429)
      ) {
        this.logger.warn(
          `Could not set Cache-Control on ${file.name}, serving it through the server instead`,
        );

        return false;
      }

      throw error;
    }
  }

  private computeExpiry(expiresInSeconds: number | undefined): number {
    return (
      Date.now() +
      (expiresInSeconds ?? DEFAULT_PRESIGNED_URL_EXPIRES_IN_SECONDS) * 1000
    );
  }

  private toFolderPrefix(folderPath: string): string {
    return folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
  }

  private async copyObjectOrThrow({
    fromKey,
    toKey,
  }: {
    fromKey: string;
    toKey: string;
  }): Promise<void> {
    try {
      await this.bucket.file(fromKey).copy(this.bucket.file(toKey));
    } catch (error) {
      if (isApiErrorWithStatus(error, 404)) {
        throw buildFileNotFoundException();
      }

      throw error;
    }
  }

  private async transferFolder({
    from,
    to,
    deleteSource,
  }: {
    from: { folderPath: string };
    to: { folderPath: string };
    deleteSource: boolean;
  }): Promise<void> {
    const fromPrefix = this.toFolderPrefix(from.folderPath);
    const toPrefix = this.toFolderPrefix(to.folderPath);

    const [files] = await this.bucket.getFiles({ prefix: fromPrefix });

    if (files.length === 0) {
      throw new Error(`No objects found in the source folder ${fromPrefix}.`);
    }

    for (const file of files) {
      const toKey = `${toPrefix}${file.name.slice(fromPrefix.length)}`;

      await this.copyObjectOrThrow({ fromKey: file.name, toKey });

      if (deleteSource) {
        await file.delete({ ignoreNotFound: true });
      }
    }
  }
}
