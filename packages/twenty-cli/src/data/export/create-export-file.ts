import { randomUUID } from 'node:crypto';
import { link, lstat, open, rename, rm, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { hasErrorCode } from '@/utils/has-error-code';

const MAX_EXPORT_BYTES = 1024 * 1024 * 1024;

export const createExportFile = async ({
  path,
  force,
  signal,
}: {
  path: string;
  force: boolean;
  signal: AbortSignal;
}) => {
  const outputPath = resolve(path);
  const conflict = () =>
    new CliError({
      code: 'CONFLICT',
      exitCode: EXIT_CODE.CONFLICT,
      message: `${outputPath} already exists.`,
      hint: 'Choose another output path or use --force to replace a file.',
    });
  const runFileOperation = async <TResult>(
    operation: () => Promise<TResult>,
  ): Promise<TResult> => {
    try {
      return await operation();
    } catch (error) {
      if (hasErrorCode(error, 'EEXIST')) {
        throw conflict();
      }
      throw new CliError({
        code: 'FILE_WRITE_FAILED',
        message: `Could not save the CSV file to ${outputPath}.`,
        hint: 'Check that the output directory exists, is writable, and has enough free space.',
        cause: error,
      });
    }
  };
  const existing = await runFileOperation(() =>
    lstat(outputPath).catch((error: unknown) => {
      if (hasErrorCode(error, 'ENOENT')) {
        return undefined;
      }
      throw error;
    }),
  );
  if (isDefined(existing) && (!force || !existing.isFile())) {
    throw conflict();
  }
  const temporaryPath = `${outputPath}.${randomUUID()}.tmp`;
  const file = await runFileOperation(() => open(temporaryPath, 'wx', 0o600));
  const cleanup = async () => {
    await file.close().catch(() => undefined);
    await rm(temporaryPath, { force: true }).catch(() => undefined);
  };
  if (!force) {
    const probePath = `${temporaryPath}.probe`;
    try {
      await link(temporaryPath, probePath);
    } catch (error) {
      await cleanup();
      throw new CliError({
        code: 'FILE_WRITE_FAILED',
        message: `Could not prepare a non-overwriting export to ${outputPath}.`,
        hint: 'The output directory must support hard links. Choose a writable directory on a filesystem that supports them, or use --force to allow replacing the destination file.',
        cause: error,
      });
    }
    try {
      await runFileOperation(() => unlink(probePath));
    } catch (error) {
      await rm(probePath, { force: true }).catch(() => undefined);
      await cleanup();
      throw error;
    }
  }
  return {
    outputPath,
    save: async (body: ReadableStream<Uint8Array>) => {
      let bytes = 0;
      const reader = body.getReader();
      try {
        for (
          let chunk = await reader.read();
          !chunk.done;
          chunk = await reader.read()
        ) {
          signal.throwIfAborted();
          bytes += chunk.value.byteLength;
          if (bytes > MAX_EXPORT_BYTES) {
            throw new CliError({
              code: 'RESPONSE_LIMIT_EXCEEDED',
              message: 'The CSV export exceeds the 1 GiB download limit.',
            });
          }
          await runFileOperation(() => file.writeFile(chunk.value));
        }
      } finally {
        await reader.cancel().catch(() => undefined);
        reader.releaseLock();
      }
      await runFileOperation(() => file.sync());
      await runFileOperation(() => file.close());
      signal.throwIfAborted();
      if (force) {
        await runFileOperation(() => rename(temporaryPath, outputPath));
      } else {
        await runFileOperation(() => link(temporaryPath, outputPath));
      }
      return bytes;
    },
    cleanup,
  };
};
