import { type ManifestBuildResult } from '../manifest/manifest-build';

export interface RestartableWatcher {
  restart(result: ManifestBuildResult): Promise<void>;
  start(): Promise<void>;
  close(): Promise<void>;
  shouldRestart(result: ManifestBuildResult): boolean;
}

export type OnFileBuiltCallback = (builtPath: string, checksum: string) => void;

export type RestartableWatcherOptions = {
  appPath: string;
  buildResult: ManifestBuildResult | null;
  watch?: boolean;
  onFileBuilt?: OnFileBuiltCallback;
};
