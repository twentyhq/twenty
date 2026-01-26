import { type FileFolder } from 'twenty-shared/types';

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

export type OnBuildErrorCallback = (errors: string[]) => void | Promise<void>;

export type RestartableWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  handleFileBuilt: OnFileBuiltCallback;
  handleBuildError: OnBuildErrorCallback;
};
