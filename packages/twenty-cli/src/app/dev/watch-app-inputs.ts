import { realpath } from 'node:fs/promises';
import { relative, sep } from 'node:path';

import { watch, type FSWatcher } from 'chokidar';
import { isDefined } from 'twenty-shared/utils';

import { isBroadWatchDirectory } from '@/app/dev/is-broad-watch-directory';
import { isIgnoredWatchPath } from '@/app/dev/is-ignored-watch-path';
import { readWatchInputStamp } from '@/app/dev/read-watch-input-stamp';
import { type WatchInputs } from '@/app/dev/types/watch-inputs.type';
import { type WatchScope } from '@/app/dev/types/watch-scope.type';
import { watchExternalInput } from '@/app/dev/watch-external-input';
import { type Output } from '@/output/types/output.type';
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
  onWarning,
  onScopeChange,
}: {
  appPath: string;
  signal: AbortSignal;
  onChange: () => void;
  onError: (error: Error) => void;
  onWarning?: Output['warn'];
  onScopeChange?: (scope: WatchScope) => Promise<void>;
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
  let stopExternalWatchers: (() => void)[] = [];
  let excludedDirectories = new Set<string>();
  let successfulInputs: WatchInputs = [];
  let previousScopeKey: string | undefined;

  const reportScopeChange = async (inputs: WatchInputs) => {
    if (!isDefined(onScopeChange)) {
      return;
    }

    const scope: WatchScope = {
      filePaths: inputs
        .filter((input) => input.kind === 'file')
        .map((input) => input.path)
        .sort(),
      directoryPaths: inputs
        .filter((input) => input.kind === 'directory')
        .map((input) => input.path)
        .sort(),
      excludedDirectoryPaths: [...excludedDirectories].sort(),
    };
    const scopeKey = JSON.stringify(scope);
    if (scopeKey === previousScopeKey) {
      return;
    }

    await onScopeChange(scope);
    previousScopeKey = scopeKey;
  };

  const close = async () => {
    for (const stop of stopExternalWatchers) stop();
    stopExternalWatchers = [];
    await rootWatcher.close();
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
          !isIgnoredWatchPath(input.path) &&
          input.path !== appPath &&
          !isInsideDirectory({ filePath: input.path, directory: appPath }),
      );
      const nextExcludedDirectories = new Set(
        externalInputs
          .filter(
            (input) =>
              input.kind === 'directory' && isBroadWatchDirectory(input.path),
          )
          .map((input) => input.path),
      );
      for (const directory of nextExcludedDirectories) {
        if (!excludedDirectories.has(directory)) {
          onWarning?.({
            code: 'WATCH_SCOPE_LIMITED',
            message: `Not watching directory ${directory}. Known files there are still watched. After fixing an unresolved import there, edit an app file or restart twenty app dev.`,
          });
        }
      }
      excludedDirectories = nextExcludedDirectories;
      const previousWatchers = stopExternalWatchers;
      stopExternalWatchers = [];
      const uniqueInputs = new Map(
        externalInputs.map((input) => [`${input.kind}:${input.path}`, input]),
      );
      const watchedInputs = [...uniqueInputs.values()].filter(
        (input) =>
          input.kind !== 'directory' || !excludedDirectories.has(input.path),
      );

      for (const input of watchedInputs) {
        stopExternalWatchers.push(
          watchExternalInput({ input, onChange, onError }),
        );
      }
      for (const stop of previousWatchers) stop();

      await reportScopeChange(watchedInputs);

      if (inputs.some((input) => readWatchInputStamp(input) !== input.stamp)) {
        onChange();
      }
    },
  };
};
