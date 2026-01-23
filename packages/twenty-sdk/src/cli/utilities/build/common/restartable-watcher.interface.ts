export interface RestartableWatcher {
  restart(sourcePaths: string[]): Promise<void>;
  start(): Promise<void>;
  close(): Promise<void>;
  shouldRestart(sourcePaths: string[]): boolean;
}

export type OnFileBuiltCallback = (
  builtPath: string,
  checksum: string,
) => void | Promise<void>;

export type RestartableWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  onFileBuilt?: OnFileBuiltCallback;
};
