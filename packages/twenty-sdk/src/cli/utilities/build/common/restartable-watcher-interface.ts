import { type FileFolder } from 'twenty-shared/types';
import { type Location } from 'esbuild';

export interface RestartableWatcher {
  restart(sourcePaths: string[]): Promise<void>;
  start(): Promise<void>;
  close(): Promise<void>;
  shouldRestart(sourcePaths: string[]): boolean;
}

export type OnFileBuiltCallback = (options: {
  fileFolder: FileFolder;
  builtPath: string;
  filePath: string;
  checksum: string;
}) => void | Promise<void>;

export type OnBuildErrorCallback = (
  errors: { error: string; location: Location | null }[],
) => void | Promise<void>;

export type RestartableWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  handleFileBuilt: OnFileBuiltCallback;
  handleBuildError: OnBuildErrorCallback;
};
