import { link, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { AppPathError } from '@/app/pull/app-path-error';
import { assertPullPaths } from '@/app/pull/assert-pull-paths';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { hasErrorCode } from '@/utils/has-error-code';

export const writeAppAddFile = async ({
  appPath,
  file,
  signal,
}: {
  appPath: string;
  file: { path: string; content: string };
  signal: AbortSignal;
}) => {
  signal.throwIfAborted();

  try {
    await assertPullPaths({ appPath, relativePaths: [file.path] });
  } catch (error) {
    if (!(error instanceof AppPathError)) throw error;

    throw new CliError({
      code: 'APP_PATH_UNAVAILABLE',
      exitCode: EXIT_CODE.CONFLICT,
      message: `Cannot create ${file.path}: the destination must stay inside the app and cannot contain symbolic links.`,
    });
  }

  const destination = join(appPath, file.path);

  await mkdir(dirname(destination), { recursive: true });
  signal.throwIfAborted();

  const temporaryDirectory = await mkdtemp(
    join(dirname(destination), '.twenty-add-'),
  );
  const temporaryPath = join(temporaryDirectory, 'definition');
  let cleanupFailed = false;

  try {
    await writeFile(temporaryPath, file.content, { flag: 'wx' });
    signal.throwIfAborted();
    await link(temporaryPath, destination);
  } catch (error) {
    if (hasErrorCode(error, 'EEXIST')) {
      throw new CliError({
        code: 'APP_PATH_UNAVAILABLE',
        exitCode: EXIT_CODE.CONFLICT,
        message: `${file.path} already exists. No files were changed.`,
        hint: 'Choose a different name, or edit the existing definition.',
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
