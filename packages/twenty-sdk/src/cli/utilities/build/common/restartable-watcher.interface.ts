export interface RestartableWatcher {
  restart(sourcePaths: string[]): Promise<void>;
  start(): Promise<void>;
  close(): Promise<void>;
  shouldRestart(sourcePaths: string[]): boolean;
}

export type OnFileBuiltCallback = (builtPath: string, checksum: string) => void;

// Callback that includes source asset paths (resolved to built assets by app-dev)
export type OnFileBuiltWithAssetPathsCallback = (
  builtPath: string,
  checksum: string,
  sourceAssetPaths: string[],
) => void;

export type RestartableWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  onFileBuilt?: OnFileBuiltCallback;
};

export type WatcherWithAssetTrackingOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  onFileBuilt?: OnFileBuiltWithAssetPathsCallback;
};
