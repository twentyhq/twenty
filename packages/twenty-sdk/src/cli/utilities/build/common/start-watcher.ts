import {
  type EsbuildWatcher,
  type EsbuildWatcherFactoryOptions,
} from '@/cli/utilities/build/common/esbuild-watcher';
import {
  type OnBuildErrorCallback,
  type OnFileBuiltCallback,
} from '@/cli/utilities/build/common/restartable-watcher-interface';

export type WatcherCallbacks = {
  handleFileBuilt: OnFileBuiltCallback;
  handleBuildError: OnBuildErrorCallback;
};

export type BuildEntityFilesOptions = {
  appPath: string;
  sourcePaths: string[];
  onFileBuilt: OnFileBuiltCallback;
  watcherCallbacks?: WatcherCallbacks;
};

export const startWatcher = async ({
  appPath,
  sourcePaths,
  watcherCallbacks,
  watcherFactory,
}: {
  appPath: string;
  sourcePaths: string[];
  watcherCallbacks: WatcherCallbacks;
  watcherFactory: (options: EsbuildWatcherFactoryOptions) => EsbuildWatcher;
}): Promise<EsbuildWatcher | null> => {
  if (sourcePaths.length === 0) {
    return null;
  }

  const watcher = watcherFactory({
    appPath,
    sourcePaths,
    shouldSkipTypecheck: () => true,
    handleFileBuilt: watcherCallbacks.handleFileBuilt,
    handleBuildError: watcherCallbacks.handleBuildError,
    watch: true,
  });

  await watcher.start();

  return watcher;
};
