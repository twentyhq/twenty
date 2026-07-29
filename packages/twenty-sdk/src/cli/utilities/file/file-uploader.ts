import { ApiService } from '@/cli/utilities/api/api-service';
import { type ApplicationFileUploadRequest } from '@/cli/utilities/api/file-api';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { putFileToUploadUrl } from '@/cli/utilities/file/put-file-to-upload-url';
import * as fs from 'fs';
import path, { relative } from 'path';
import {
  APPLICATION_FILE_UPLOAD_BATCH_SIZE,
  OUTPUT_DIR,
} from 'twenty-shared/application';
import { type FileFolder } from 'twenty-shared/types';

export type FileToUpload = {
  builtPath: string;
  fileFolder: FileFolder;
};

export type FileUploadFailure = {
  builtPath: string;
  error: string;
};

// Bounds how many files are in flight against storage at once: the batch is
// already reserved server-side, only the PUTs are throttled here.
const DIRECT_UPLOAD_CONCURRENCY = 10;

// A server that predates the batched mutations rejects the query at
// validation time, before any file is touched.
const isDirectUploadUnsupportedError = (error: string): boolean =>
  error.includes('createApplicationFileUploads') &&
  (error.includes('Cannot query field') ||
    error.includes('Unknown type') ||
    error.includes('Unknown argument'));

export class FileUploader {
  private apiService = new ApiService();
  private applicationUniversalIdentifier: string;
  private appPath: string;
  private supportsDirectUpload = true;

  constructor(options: {
    applicationUniversalIdentifier: string;
    appPath: string;
  }) {
    this.applicationUniversalIdentifier =
      options.applicationUniversalIdentifier;
    this.appPath = options.appPath;
  }

  async uploadFile({
    builtPath,
    fileFolder,
  }: {
    builtPath: string;
    fileFolder: FileFolder;
  }) {
    const builtHandlerPath = relative(OUTPUT_DIR, builtPath);

    return await this.apiService.uploadFile({
      filePath: path.join(this.appPath, builtPath),
      builtHandlerPath,
      fileFolder,
      applicationUniversalIdentifier: this.applicationUniversalIdentifier,
    });
  }

  // Uploads every file through the direct-upload flow: one call reserves a
  // batch of upload urls, the bytes go straight to storage, one call confirms
  // them. A whole app therefore costs a couple of rate-limited api calls per
  // batch instead of one per file, which is what makes large apps deployable.
  async uploadFiles(files: FileToUpload[]): Promise<FileUploadFailure[]> {
    const failures: FileUploadFailure[] = [];

    for (
      let index = 0;
      index < files.length;
      index += APPLICATION_FILE_UPLOAD_BATCH_SIZE
    ) {
      const batch = files.slice(
        index,
        index + APPLICATION_FILE_UPLOAD_BATCH_SIZE,
      );

      failures.push(
        ...(await (this.supportsDirectUpload
          ? this.uploadBatch(batch)
          : this.uploadBatchOneByOne(batch))),
      );
    }

    return failures;
  }

  private async uploadBatch(
    batch: FileToUpload[],
  ): Promise<FileUploadFailure[]> {
    const uploadRequests: ApplicationFileUploadRequest[] = batch.map(
      ({ builtPath, fileFolder }) => ({
        fileFolder,
        filePath: relative(OUTPUT_DIR, builtPath),
        size: fs.statSync(path.join(this.appPath, builtPath)).size,
      }),
    );

    const createResult = await this.apiService.createApplicationFileUploads({
      applicationUniversalIdentifier: this.applicationUniversalIdentifier,
      files: uploadRequests,
    });

    if (!createResult.success) {
      const error = serializeError(createResult.error);

      if (isDirectUploadUnsupportedError(error)) {
        this.supportsDirectUpload = false;

        return this.uploadBatchOneByOne(batch);
      }

      return this.failWholeBatch(batch, error);
    }

    const uploadTargets = createResult.data;

    if (uploadTargets.length !== batch.length) {
      return this.failWholeBatch(
        batch,
        `Server returned ${uploadTargets.length} upload urls for ${batch.length} files`,
      );
    }

    const failures: FileUploadFailure[] = [];
    const uploadedFileIds: string[] = [];

    await this.runWithConcurrency(batch, async (file, fileIndex) => {
      const uploadTarget = uploadTargets[fileIndex];

      try {
        await putFileToUploadUrl({
          absolutePath: path.join(this.appPath, file.builtPath),
          uploadUrl: uploadTarget.uploadUrl,
          contentType: uploadTarget.contentType,
        });

        uploadedFileIds.push(uploadTarget.fileId);
      } catch (error) {
        failures.push({
          builtPath: file.builtPath,
          error: serializeError(error),
        });
      }
    });

    if (uploadedFileIds.length === 0) {
      return failures;
    }

    const completeResult = await this.apiService.completeApplicationFileUploads(
      {
        applicationUniversalIdentifier: this.applicationUniversalIdentifier,
        fileIds: uploadedFileIds,
      },
    );

    if (!completeResult.success) {
      // The bytes reached storage but the records were never confirmed, so
      // everything that was not already reported has to be retried too.
      const uploadedFiles = batch.filter(
        (file) =>
          !failures.some((failure) => failure.builtPath === file.builtPath),
      );

      return [
        ...failures,
        ...this.failWholeBatch(
          uploadedFiles,
          serializeError(completeResult.error),
        ),
      ];
    }

    return failures;
  }

  // Servers older than the direct-upload mutations still accept the one
  // multipart call per file, so a newer cli keeps working against them — it
  // just stays exposed to the rate limit that motivated the batched flow.
  private async uploadBatchOneByOne(
    batch: FileToUpload[],
  ): Promise<FileUploadFailure[]> {
    const failures: FileUploadFailure[] = [];

    await this.runWithConcurrency(batch, async (file) => {
      const result = await this.uploadFile(file);

      if (!result.success) {
        failures.push({
          builtPath: file.builtPath,
          error: serializeError(result.error),
        });
      }
    });

    return failures;
  }

  private failWholeBatch(
    batch: FileToUpload[],
    error: string,
  ): FileUploadFailure[] {
    return batch.map(({ builtPath }) => ({ builtPath, error }));
  }

  private async runWithConcurrency(
    files: FileToUpload[],
    handle: (file: FileToUpload, fileIndex: number) => Promise<void>,
  ): Promise<void> {
    let nextIndex = 0;

    const worker = async () => {
      while (nextIndex < files.length) {
        const fileIndex = nextIndex++;

        await handle(files[fileIndex], fileIndex);
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(DIRECT_UPLOAD_CONCURRENCY, files.length) },
        worker,
      ),
    );
  }
}
