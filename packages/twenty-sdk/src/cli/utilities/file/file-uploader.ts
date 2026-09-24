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

const DIRECT_UPLOAD_CONCURRENCY = 10;

export class FileUploader {
  private apiService = new ApiService();
  private applicationUniversalIdentifier: string;
  private appPath: string;

  constructor(options: {
    applicationUniversalIdentifier: string;
    appPath: string;
  }) {
    this.applicationUniversalIdentifier =
      options.applicationUniversalIdentifier;
    this.appPath = options.appPath;
  }

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

      failures.push(...(await this.uploadBatch(batch)));
    }

    return failures;
  }

  private async uploadBatch(
    batch: FileToUpload[],
  ): Promise<FileUploadFailure[]> {
    const builtPathByRelativePath = new Map<string, string>(
      batch.map(({ builtPath }) => [
        relative(OUTPUT_DIR, builtPath),
        builtPath,
      ]),
    );

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
      return this.failWholeBatch(batch, serializeError(createResult.error));
    }

    const { targets, errors: createErrors } = createResult.data;

    const failures: FileUploadFailure[] = createErrors.map((error) => ({
      builtPath: builtPathByRelativePath.get(error.filePath) ?? error.filePath,
      error: error.message,
    }));

    const builtPathByFileId = new Map<string, string>();
    const uploadedFileIds: string[] = [];

    await this.runWithConcurrency(targets, async (target) => {
      const builtPath = builtPathByRelativePath.get(target.filePath);

      if (builtPath === undefined) {
        return;
      }

      builtPathByFileId.set(target.fileId, builtPath);

      try {
        await putFileToUploadUrl({
          absolutePath: path.join(this.appPath, builtPath),
          uploadUrl: target.uploadUrl,
          contentType: target.contentType,
        });

        uploadedFileIds.push(target.fileId);
      } catch (error) {
        failures.push({ builtPath, error: serializeError(error) });
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
      return [
        ...failures,
        ...uploadedFileIds.map((fileId) => ({
          builtPath: builtPathByFileId.get(fileId) ?? fileId,
          error: serializeError(completeResult.error),
        })),
      ];
    }

    for (const error of completeResult.data.errors) {
      failures.push({
        builtPath: builtPathByFileId.get(error.fileId) ?? error.fileId,
        error: error.message,
      });
    }

    return failures;
  }

  private failWholeBatch(
    batch: FileToUpload[],
    error: string,
  ): FileUploadFailure[] {
    return batch.map(({ builtPath }) => ({ builtPath, error }));
  }

  private async runWithConcurrency<TItem>(
    items: TItem[],
    handle: (item: TItem, index: number) => Promise<void>,
  ): Promise<void> {
    let nextIndex = 0;

    const worker = async () => {
      while (nextIndex < items.length) {
        const index = nextIndex++;

        await handle(items[index], index);
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(DIRECT_UPLOAD_CONCURRENCY, items.length) },
        worker,
      ),
    );
  }
}
