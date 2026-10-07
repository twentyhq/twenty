import { constants } from 'node:fs';
import {
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rename,
  rm,
  rmdir,
  stat,
  unlink,
} from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { renderAppTemplate } from '@/app/render-app-template';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { hasErrorCode } from '@/utils/has-error-code';

const TEMPLATE_PLACEHOLDER = 'TO-BE-GENERATED';

const createAppPathUnavailableError = ({
  appDirectory,
  reason,
}: {
  appDirectory: string;
  reason: string;
}) =>
  new CliError({
    code: 'APP_PATH_UNAVAILABLE',
    exitCode: EXIT_CODE.CONFLICT,
    message: `${appDirectory} already exists and ${reason}.`,
    hint: 'Choose another app name, or pass --path with a new or empty directory.',
    details: { path: appDirectory },
  });

const readAvailableAppDirectory = async (
  appDirectory: string,
): Promise<'missing' | 'empty'> => {
  const stats = await stat(appDirectory).catch((error: unknown) => {
    if (hasErrorCode(error, 'ENOENT')) {
      return undefined;
    }

    throw error;
  });

  if (!isDefined(stats)) {
    return 'missing';
  }

  if (!stats.isDirectory()) {
    throw createAppPathUnavailableError({
      appDirectory,
      reason: 'is not a directory',
    });
  }

  if (isNonEmptyArray(await readdir(appDirectory))) {
    throw createAppPathUnavailableError({
      appDirectory,
      reason: 'is not empty',
    });
  }

  return 'empty';
};

const findUnrenderedFiles = async (directory: string) => {
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  const unrenderedFiles: string[] = [];

  for (const entry of entries) {
    const filePath = join(entry.parentPath, entry.name);

    if (
      entry.isFile() &&
      (await readFile(filePath, 'utf8')).includes(TEMPLATE_PLACEHOLDER)
    ) {
      unrenderedFiles.push(relative(directory, filePath));
    }
  }

  return unrenderedFiles;
};

const copyIntoEmptyDirectory = async ({
  stagingDirectory,
  appDirectory,
}: {
  stagingDirectory: string;
  appDirectory: string;
}) => {
  const createdEntries: { createdPath: string; isDirectory: boolean }[] = [];

  try {
    for (const entry of await readdir(stagingDirectory, {
      recursive: true,
      withFileTypes: true,
    })) {
      const sourcePath = join(entry.parentPath, entry.name);
      const createdPath = join(
        appDirectory,
        relative(stagingDirectory, sourcePath),
      );

      if (entry.isDirectory()) {
        await mkdir(createdPath);
      } else {
        await copyFile(sourcePath, createdPath, constants.COPYFILE_EXCL);
      }

      createdEntries.push({ createdPath, isDirectory: entry.isDirectory() });
    }
  } catch (error) {
    for (const { createdPath, isDirectory } of createdEntries.reverse()) {
      await (isDirectory ? rmdir(createdPath) : unlink(createdPath)).catch(
        () => undefined,
      );
    }

    throw error;
  }

  await rm(stagingDirectory, { recursive: true, force: true });
};

export const createAppProject = async ({
  appDirectory,
  appName,
  appDisplayName,
  appDescription,
  signal,
}: {
  appDirectory: string;
  appName: string;
  appDisplayName: string;
  appDescription: string;
  signal: AbortSignal;
}) => {
  await readAvailableAppDirectory(appDirectory);

  const parentDirectory = dirname(appDirectory);

  await mkdir(parentDirectory, { recursive: true });

  const stagingDirectory = await mkdtemp(
    join(parentDirectory, `.${basename(appDirectory)}-`),
  );

  try {
    await renderAppTemplate({
      appName,
      appDisplayName,
      appDescription,
      appDirectory: stagingDirectory,
    });
    signal.throwIfAborted();

    const unrenderedFiles = await findUnrenderedFiles(stagingDirectory);

    if (isNonEmptyArray(unrenderedFiles)) {
      throw new CliError({
        code: 'APP_INIT_FAILED',
        message: `The app template still has placeholders in ${unrenderedFiles.join(', ')}.`,
        hint: 'This CLI ships an app template it cannot render. Upgrade the twenty CLI.',
        details: { unrenderedFiles },
      });
    }

    signal.throwIfAborted();

    if ((await readAvailableAppDirectory(appDirectory)) === 'empty') {
      await copyIntoEmptyDirectory({ stagingDirectory, appDirectory });
    } else {
      await rename(stagingDirectory, appDirectory);
    }
  } catch (error) {
    await rm(stagingDirectory, { recursive: true, force: true });

    if (error instanceof CliError || signal.aborted) {
      throw error;
    }

    throw new CliError({
      code: 'APP_INIT_FAILED',
      message: `Could not create ${appDirectory}: ${error instanceof Error ? error.message : String(error)}`,
      hint: 'Files this command had written there were removed. Fix the cause, then run the command again.',
      details: { path: appDirectory },
    });
  }
};
