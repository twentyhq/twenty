import {
  link,
  lstat,
  mkdir,
  mkdtemp,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { type AppAddFile } from '@/app/add/types/app-add-file.type';
import { AppPathError } from '@/app/pull/app-path-error';
import { assertPullPaths } from '@/app/pull/assert-pull-paths';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { hasErrorCode } from '@/utils/has-error-code';

export const writeAppAddFiles = async ({
  appPath,
  files,
  signal,
}: {
  appPath: string;
  files: AppAddFile[];
  signal: AbortSignal;
}) => {
  signal.throwIfAborted();

  for (const file of files) {
    try {
      await assertPullPaths({ appPath, relativePaths: [file.path] });
      await lstat(join(appPath, file.path));
      throw new CliError({
        code: 'APP_PATH_UNAVAILABLE',
        exitCode: EXIT_CODE.CONFLICT,
        message: `${file.path} already exists. No files were changed.`,
        hint: 'Choose a different name, or edit the existing definition.',
      });
    } catch (error) {
      if (error instanceof AppPathError) {
        throw new CliError({
          code: 'APP_PATH_UNAVAILABLE',
          exitCode: EXIT_CODE.CONFLICT,
          message: `Cannot create ${file.path}: the destination must stay inside the app and cannot contain symbolic links.`,
        });
      }
      if (!hasErrorCode(error, 'ENOENT')) throw error;
    }
  }

  const temporaryDirectory = await mkdtemp(join(appPath, '.twenty-add-'));
  const createdFiles: { path: string; stagedPath: string }[] = [];
  let cleanupFailed = false;

  try {
    for (const [index, file] of files.entries()) {
      signal.throwIfAborted();
      await writeFile(join(temporaryDirectory, String(index)), file.content, {
        flag: 'wx',
      });
    }

    for (const [index, file] of files.entries()) {
      signal.throwIfAborted();
      const destination = join(appPath, file.path);
      const stagedPath = join(temporaryDirectory, String(index));

      await mkdir(dirname(destination), { recursive: true });
      signal.throwIfAborted();
      try {
        await link(stagedPath, destination);
      } catch (error) {
        if (!hasErrorCode(error, 'EEXIST')) throw error;

        throw new CliError({
          code: 'APP_PATH_UNAVAILABLE',
          exitCode: EXIT_CODE.CONFLICT,
          message: `${file.path} already exists.`,
          hint: 'Choose a different name, or edit the existing definition.',
        });
      }
      createdFiles.push({ path: file.path, stagedPath });
    }
  } catch (error) {
    const remainingPaths: string[] = [];

    for (const file of createdFiles.reverse()) {
      try {
        const destination = join(appPath, file.path);
        const staged = await lstat(file.stagedPath);
        const current = await lstat(destination);

        if (staged.ino !== current.ino || staged.dev !== current.dev) continue;
        await unlink(destination);
      } catch (rollbackError) {
        if (!hasErrorCode(rollbackError, 'ENOENT'))
          remainingPaths.push(file.path);
      }
    }

    if (remainingPaths.length > 0) {
      throw new CliError({
        code: 'APP_PATH_UNAVAILABLE',
        message:
          'Could not create all definitions or remove all files created by this command.',
        hint: `Review these files before retrying: ${remainingPaths.join(', ')}.`,
        details: { createdPaths: remainingPaths },
        cause: error,
      });
    }

    throw error;
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true }).catch(() => {
      cleanupFailed = true;
    });
  }

  return cleanupFailed ? temporaryDirectory : undefined;
};
