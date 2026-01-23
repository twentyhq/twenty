export interface RestartableWatcher {
  restart(sourcePaths: string[]): Promise<void>;
  start(): Promise<void>;
  close(): Promise<void>;
  shouldRestart(sourcePaths: string[]): boolean;
}

/**
 * Callback invoked when a file has been built.
 * @param generation - The generation number when the build started
 * @param builtPath - The path to the built file (relative to output dir)
 * @param checksum - The MD5 checksum of the built file content
 */
export type OnFileBuiltCallback = (
  generation: number,
  builtPath: string,
  checksum: string,
) => void | Promise<void>;

export type RestartableWatcherOptions = {
  appPath: string;
  sourcePaths: string[];
  watch?: boolean;
  onFileBuilt?: OnFileBuiltCallback;
  /**
   * Function to get the current generation number from the orchestrator.
   * This ensures file build callbacks are tagged with the correct generation.
   */
  getCurrentGeneration?: () => number;
};
