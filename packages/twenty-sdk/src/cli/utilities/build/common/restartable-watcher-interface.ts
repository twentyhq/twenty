export interface RestartableWatcher {
  restart(sourcePaths: string[]): Promise<void>;
  start(): Promise<void>;
  close(): Promise<void>;
  shouldRestart(sourcePaths: string[]): boolean;
}

/**
 * Callback invoked when a file has been built.
 * @param builtPath - The path to the built file (relative to output dir)
 * @param checksum - The MD5 checksum of the built file content
 * @param sourcePath - The original source file path (entry point)
 */
export type OnFileBuiltCallback = (
  builtPath: string,
  checksum: string,
  sourcePath: string,
) => void | Promise<void>;

export type RestartableWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  onFileBuilt?: OnFileBuiltCallback;
};
