import {
  type EsbuildWatcher,
  type EsbuildWatcherFactoryOptions,
} from '@/cli/utilities/build/common/esbuild-watcher';
import { type OnFileBuiltCallback } from '@/cli/utilities/build/common/restartable-watcher-interface';

export type BuildEntityFilesOptions = {
  appPath: string;
  sourcePaths: string[];
  onFileBuilt: OnFileBuiltCallback;
  createWatcher?: boolean;
};

export const startWatcher = async ({
  appPath,
  sourcePaths,
  onFileBuilt,
  watcherFactory,
}: {
  appPath: string;
  sourcePaths: string[];
  onFileBuilt: OnFileBuiltCallback;
  watcherFactory: (options: EsbuildWatcherFactoryOptions) => EsbuildWatcher;
}): Promise<EsbuildWatcher | null> => {
  if (sourcePaths.length === 0) {
    return null;
  }

  const watcher = watcherFactory({
    appPath,
    sourcePaths,
    shouldSkipTypecheck: () => true,
    handleBuildError: () => {},
    handleFileBuilt: onFileBuilt,
    watch: false,
  });

  await watcher.start();

  return watcher;
};
