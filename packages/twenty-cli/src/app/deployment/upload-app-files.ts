import { isArray, isNonEmptyString } from '@sniptt/guards';
import { APPLICATION_FILE_UPLOAD_BATCH_SIZE } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { APP_APPLY } from '@/app/deployment/constants/app-apply.constant';
import { UPLOAD_FILE_FOLDER_BY_ARTIFACT_ROLE } from '@/app/deployment/constants/upload-file-folder-by-artifact-role.constant';
import { putUploadFile } from '@/app/deployment/put-upload-file';
import { readSnapshotFile } from '@/app/deployment/read-snapshot-file';
import { type AppUploadProgress } from '@/app/deployment/types/app-upload-progress.type';
import {
  type ToolingArtifact,
  type ToolingBuild,
} from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

type UploadTarget = {
  fileId: string;
  filePath: string;
  uploadUrl: string;
  contentType: string;
};

type UploadFailure = {
  path: string;
  message: string;
};

type UploadBatchContext = {
  applicationUniversalIdentifier: string;
  snapshotDirectory: string;
  target: ResolvedTarget;
  signal: AbortSignal;
  progress: AppUploadProgress;
};

const createInvalidUploadResponseError = () =>
  new CliError({
    code: 'INVALID_RESPONSE',
    message: 'The server returned an invalid file upload response.',
  });

const isUploadTarget = (value: unknown): value is UploadTarget =>
  isPlainObject(value) &&
  isNonEmptyString(value.fileId) &&
  isNonEmptyString(value.filePath) &&
  isNonEmptyString(value.uploadUrl) &&
  isNonEmptyString(value.contentType);

const readUploadErrors = ({
  value,
  idKey,
}: {
  value: unknown;
  idKey: 'filePath' | 'fileId';
}) => {
  if (!isArray(value)) {
    throw createInvalidUploadResponseError();
  }

  return value.map((entry) => {
    const id = isPlainObject(entry) ? entry[idKey] : undefined;

    if (!isPlainObject(entry) || !isNonEmptyString(id)) {
      throw createInvalidUploadResponseError();
    }

    return {
      id,
      message: isNonEmptyString(entry.message)
        ? entry.message
        : 'The server refused this file.',
    };
  });
};

const toUploadRequest = (artifact: ToolingArtifact) => {
  const fileFolder = UPLOAD_FILE_FOLDER_BY_ARTIFACT_ROLE[artifact.role];

  if (!isDefined(fileFolder)) {
    throw new CliError({
      code: 'TOOLING_UNSUPPORTED',
      message: `The build contains a ${artifact.role} file, which the CLI cannot upload.`,
      details: { path: artifact.path, role: artifact.role },
    });
  }

  return {
    fileFolder,
    filePath: artifact.path,
    size: artifact.size,
    sha256: artifact.sha256,
  };
};

const runConcurrently = async <TItem>({
  items,
  run,
}: {
  items: TItem[];
  run: (item: TItem) => Promise<void>;
}) => {
  let nextIndex = 0;
  let firstFailure: { error: unknown } | undefined;

  const runNext = async (): Promise<void> => {
    if (nextIndex >= items.length || isDefined(firstFailure)) {
      return;
    }

    const item = items[nextIndex];

    nextIndex += 1;

    try {
      await run(item);
    } catch (error) {
      firstFailure ??= { error };
    }

    await runNext();
  };

  await Promise.all(
    Array.from(
      { length: Math.min(APP_APPLY.UPLOAD_CONCURRENCY, items.length) },
      runNext,
    ),
  );

  if (isDefined(firstFailure)) {
    throw firstFailure.error;
  }
};

const requestUploadTargets = async ({
  artifacts,
  context,
}: {
  artifacts: ToolingArtifact[];
  context: UploadBatchContext;
}) => {
  const data = await createMetadataClient({
    target: context.target,
    signal: context.signal,
  }).mutation({
    __name: 'CreateApplicationFileUploads',
    createApplicationFileUploads: {
      __args: {
        applicationUniversalIdentifier: context.applicationUniversalIdentifier,
        files: artifacts.map(toUploadRequest),
      },
      targets: {
        fileId: true,
        filePath: true,
        uploadUrl: true,
        contentType: true,
      },
      unchangedFiles: { fileFolder: true, filePath: true },
      errors: { filePath: true, message: true },
    },
  });
  const created = data?.createApplicationFileUploads;

  if (
    !isPlainObject(created) ||
    !isArray(created.targets) ||
    !created.targets.every(isUploadTarget)
  ) {
    throw createInvalidUploadResponseError();
  }

  context.progress.hasCreatedTargets ||= created.targets.length > 0;

  const unchangedFiles = created.unchangedFiles;

  if (
    !isArray(unchangedFiles) ||
    !unchangedFiles.every(
      (file) =>
        isPlainObject(file) &&
        artifacts.some(
          (artifact) =>
            file.filePath === artifact.path &&
            file.fileFolder === toUploadRequest(artifact).fileFolder,
        ),
    )
  ) {
    throw createInvalidUploadResponseError();
  }

  const answeredFilePaths = [
    ...created.targets.map((file) => file.filePath),
    ...unchangedFiles.map((file) => file.filePath),
  ];

  if (
    new Set(answeredFilePaths).size !== answeredFilePaths.length ||
    !answeredFilePaths.every((path) =>
      artifacts.some((artifact) => artifact.path === path),
    )
  ) {
    throw createInvalidUploadResponseError();
  }

  const refusals = readUploadErrors({
    value: created.errors,
    idKey: 'filePath',
  });
  const answeredPaths = new Set([
    ...answeredFilePaths,
    ...refusals.map(({ id }) => id),
  ]);

  return {
    uploadTargets: created.targets,
    failures: [
      ...refusals.map(({ id, message }) => ({ path: id, message })),
      ...artifacts
        .filter((artifact) => !answeredPaths.has(artifact.path))
        .map((artifact) => ({
          path: artifact.path,
          message: 'The server did not accept this file.',
        })),
    ],
  };
};

const sendUploadedBytes = async ({
  uploadTargets,
  artifactByPath,
  context,
  failures,
}: {
  uploadTargets: UploadTarget[];
  artifactByPath: Map<string, ToolingArtifact>;
  context: UploadBatchContext;
  failures: UploadFailure[];
}) => {
  const sentTargets: UploadTarget[] = [];

  await runConcurrently({
    items: uploadTargets,
    run: async (uploadTarget) => {
      const artifact = artifactByPath.get(uploadTarget.filePath);

      if (!isDefined(artifact)) {
        failures.push({
          path: uploadTarget.filePath,
          message: 'The server asked for a file this build does not have.',
        });

        return;
      }

      const bytes = await readSnapshotFile({
        snapshotDirectory: context.snapshotDirectory,
        artifact,
      });

      try {
        const status = await putUploadFile({
          uploadUrl: uploadTarget.uploadUrl,
          contentType: uploadTarget.contentType,
          bytes,
          signal: context.signal,
        });

        if (status < 200 || status >= 300) {
          failures.push({
            path: artifact.path,
            message: `File storage answered ${status}.`,
          });

          return;
        }

        sentTargets.push(uploadTarget);
      } catch (error) {
        if (context.signal.aborted || error instanceof CliError) {
          throw error;
        }

        failures.push({
          path: artifact.path,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    },
  });

  return sentTargets;
};

const completeUploads = async ({
  sentTargets,
  artifactByPath,
  context,
  failures,
}: {
  sentTargets: UploadTarget[];
  artifactByPath: Map<string, ToolingArtifact>;
  context: UploadBatchContext;
  failures: UploadFailure[];
}) => {
  if (!isNonEmptyArray(sentTargets)) {
    return;
  }

  const data = await createMetadataClient({
    target: context.target,
    signal: context.signal,
  }).mutation({
    __name: 'CompleteApplicationFileUploads',
    completeApplicationFileUploads: {
      __args: {
        applicationUniversalIdentifier: context.applicationUniversalIdentifier,
        fileIds: sentTargets.map((uploadTarget) => uploadTarget.fileId),
      },
      errors: { fileId: true, message: true },
    },
  });
  const completion = data?.completeApplicationFileUploads;

  if (!isPlainObject(completion)) {
    throw createInvalidUploadResponseError();
  }

  const completionErrors = readUploadErrors({
    value: completion.errors,
    idKey: 'fileId',
  });
  const failedFileIds = new Set(completionErrors.map(({ id }) => id));
  const pathByFileId = new Map(
    sentTargets.map((uploadTarget) => [
      uploadTarget.fileId,
      uploadTarget.filePath,
    ]),
  );

  failures.push(
    ...completionErrors.map(({ id, message }) => ({
      path: pathByFileId.get(id) ?? id,
      message,
    })),
  );

  for (const uploadTarget of sentTargets) {
    if (!failedFileIds.has(uploadTarget.fileId)) {
      context.progress.fileCount += 1;
      context.progress.byteCount +=
        artifactByPath.get(uploadTarget.filePath)?.size ?? 0;
    }
  }
};

export const uploadAppFiles = async ({
  build,
  snapshotDirectory,
  target,
  signal,
  progress,
  onFilesToUpload,
}: {
  build: ToolingBuild;
  snapshotDirectory: string;
  target: ResolvedTarget;
  signal: AbortSignal;
  progress: AppUploadProgress;
  onFilesToUpload?: (count: number) => void;
}) => {
  build.files.forEach(toUploadRequest);

  for (const artifact of build.files) {
    await readSnapshotFile({ snapshotDirectory, artifact });
  }

  const context: UploadBatchContext = {
    applicationUniversalIdentifier: build.application.universalIdentifier,
    snapshotDirectory,
    target,
    signal,
    progress,
  };
  const artifactByPath = new Map(
    build.files.map((artifact) => [artifact.path, artifact]),
  );
  const failures: UploadFailure[] = [];
  let filesToUploadCount = 0;

  for (
    let batchStart = 0;
    batchStart < build.files.length;
    batchStart += APPLICATION_FILE_UPLOAD_BATCH_SIZE
  ) {
    const { uploadTargets, failures: refusals } = await requestUploadTargets({
      artifacts: build.files.slice(
        batchStart,
        batchStart + APPLICATION_FILE_UPLOAD_BATCH_SIZE,
      ),
      context,
    });

    failures.push(...refusals);
    filesToUploadCount += uploadTargets.length;

    if (uploadTargets.length > 0) {
      onFilesToUpload?.(uploadTargets.length);
    }

    const sentTargets = await sendUploadedBytes({
      uploadTargets,
      artifactByPath,
      context,
      failures,
    });

    await completeUploads({ sentTargets, artifactByPath, context, failures });
  }

  if (filesToUploadCount === 0 && failures.length === 0) {
    onFilesToUpload?.(0);
  }

  if (isNonEmptyArray(failures)) {
    throw new CliError({
      code: 'UPLOAD_FAILED',
      message: `${failures.length} of ${build.files.length} files could not be uploaded.`,
      details: { failures },
    });
  }
};
