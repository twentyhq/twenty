export interface RestartableWatcher {
  restart(sourcePaths: string[]): Promise<void>;
  start(): Promise<void>;
  close(): Promise<void>;
  shouldRestart(sourcePaths: string[]): boolean;
}

export type BuiltAsset = {
  sourceAssetPath: string;
  builtAssetPath: string;
  builtAssetChecksum: string;
};

export type OnFileBuiltCallback = (builtPath: string, checksum: string) => void;

export type OnFileBuiltWithAssetsCallback = (
  builtPath: string,
  checksum: string,
  assets: BuiltAsset[],
) => void;

export type RestartableWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  onFileBuilt?: OnFileBuiltCallback;
};

export type FrontComponentWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  onFileBuilt?: OnFileBuiltWithAssetsCallback;
};
