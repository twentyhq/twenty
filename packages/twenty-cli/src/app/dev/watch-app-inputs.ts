import { realpath } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

import { watch, type FSWatcher } from 'chokidar';

import { isIgnoredWatchPath } from '@/app/dev/is-ignored-watch-path';
import { readWatchInputStamp } from '@/app/dev/read-watch-input-stamp';
import { type WatchInputs } from '@/app/dev/types/watch-inputs.type';
import { pathExistsSync } from '@/app/fs-utils';
import { isInsideDirectory } from '@/utils/is-inside-directory';

const waitUntilReady = (watcher: FSWatcher, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      watcher.off('ready', ready);
      watcher.off('error', failed);
      signal.removeEventListener('abort', aborted);
    };
    const ready = () => {
      cleanup();
      resolve();
    };
    const failed = (error: Error) => {
      cleanup();
      reject(error);
    };
    const aborted = () => {
      cleanup();
      reject(signal.reason);
    };

    watcher.once('ready', ready);
    watcher.once('error', failed);
    signal.addEventListener('abort', aborted, { once: true });

    if (signal.aborted) {
      aborted();
    }
  });

export const watchAppInputs = async ({
  appPath,
  signal,
  onChange,
  onError,
}: {
  appPath: string;
  signal: AbortSignal;
  onChange: () => void;
  onError: (error: Error) => void;
}) => {
  appPath = await realpath(appPath);
  const rootWatcher = watch(appPath, {
    ignoreInitial: true,
    followSymlinks: false,
    ignored: (path) =>
      relative(appPath, path).split(sep)[0] === 'dist' ||
      isIgnoredWatchPath(relative(appPath, path)),
    atomic: true,
  })
    .on('all', onChange)
    .on('error', onError);
  let externalWatcher: FSWatcher | undefined;
  let successfulInputs: WatchInputs = [];

  const close = async () => {
    await Promise.all([rootWatcher.close(), externalWatcher?.close()]);
  };

  try {
    await waitUntilReady(rootWatcher, signal);
  } catch (error) {
    await close();

    throw error;
  }

  return {
    close,
    update: async (inputs: WatchInputs, success: boolean) => {
      if (success) {
        successfulInputs = inputs;
      }

      const externalInputs = [...successfulInputs, ...inputs].filter(
        (input) =>
          input.path !== appPath &&
          !isInsideDirectory({ filePath: input.path, directory: appPath }),
      );
      // Missing paths are observed through their recorded parent. Adding them
      // directly can suppress directory creation events in chokidar's Node backend.
      const paths = [
        ...new Set(externalInputs.map((input) => input.path)),
      ].filter(pathExistsSync);
      const directories = new Set(
        externalInputs
          .filter((input) => input.kind === 'directory')
          .map((input) => input.path),
      );
      const files = new Set(
        externalInputs
          .filter((input) => input.kind === 'file')
          .map((input) => input.path),
      );
      const previousWatcher = externalWatcher;

      if (paths.length > 0) {
        const nextWatcher = watch(paths, {
          ignoreInitial: true,
          followSymlinks: false,
          depth: 0,
          atomic: true,
          ignored: (path) => isIgnoredWatchPath(path),
        })
          .on('all', (event, path) => {
            const absolutePath = resolve(path);
            const isDirectChild = [...directories].some((directory) => {
              const child = relative(directory, absolutePath);

              return child.length > 0 && child !== '..' && !child.includes(sep);
            });

            if (
              files.has(absolutePath) ||
              (event !== 'change' && isDirectChild)
            ) {
              onChange();
            }
          })
          .on('error', onError);

        externalWatcher = nextWatcher;
        try {
          await waitUntilReady(nextWatcher, signal);
        } catch (error) {
          await previousWatcher?.close();

          throw error;
        }
      } else {
        externalWatcher = undefined;
      }

      await previousWatcher?.close();

      if (inputs.some((input) => readWatchInputStamp(input) !== input.stamp)) {
        onChange();
      }
    },
  };
};
