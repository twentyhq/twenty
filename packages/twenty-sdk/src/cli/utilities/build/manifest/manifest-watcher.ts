import chokidar, { type FSWatcher } from 'chokidar';
import path from 'path';
import { createLogger } from '@/cli/utilities/build/common/logger';
import {
  type ManifestBuildResult,
  runManifestBuild,
} from '@/cli/utilities/build/manifest/manifest-build';

const logger = createLogger('manifest-watch');

export type ManifestWatcherCallbacks = {
  /**
   * Called when a file change is detected, BEFORE the manifest build starts.
   * This allows the orchestrator to start a new generation.
   * @param filePath - The path of the file that changed, or undefined for initial build
   * @returns The new generation number to associate with this build
   */
  onChangeDetected?: (filePath?: string) => number;
  /**
   * Called when the manifest build completes (success or failure).
   * @param generation - The generation number from onChangeDetected
   * @param result - The manifest build result
   */
  onBuildComplete?: (generation: number, result: ManifestBuildResult) => void;
  /**
   * @deprecated Use onBuildComplete instead. Kept for backwards compatibility.
   */
  onBuildSuccess?: (result: ManifestBuildResult) => Promise<void>;
};

export type ManifestWatcherOptions = {
  appPath: string;
  callbacks?: ManifestWatcherCallbacks;
};

export class ManifestWatcher {
  private appPath: string;
  private callbacks: ManifestWatcherCallbacks;
  private watcher: FSWatcher | null = null;

  constructor(options: ManifestWatcherOptions) {
    this.appPath = options.appPath;
    this.callbacks = options.callbacks ?? {};
  }

  async start(): Promise<void> {
    this.watcher = chokidar.watch(this.appPath, {
      ignored: [
        '**/node_modules/**',
        '**/.twenty/**',
        '**/dist/**',
        (filePath: string) =>
          filePath.includes('/.twenty/') || filePath.includes('\\.twenty\\'),
      ],
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
      usePolling: true,
    });

    this.watcher.on('all', async (event, filePath) => {
      if (!filePath.match(/\.(ts|tsx|json)$/)) {
        return;
      }

      // Double-check to prevent watching our own output
      if (filePath.includes('.twenty')) {
        return;
      }

      const relativeFilePath = path.relative(this.appPath, filePath);
      logger.log(`File ${event}: ${relativeFilePath}`);

      // Get generation BEFORE starting build, passing the relative file path
      const generation =
        this.callbacks.onChangeDetected?.(relativeFilePath) ?? 0;

      // Don't write manifest here - the orchestrator will write it
      // after checksums are populated by the file watchers
      const result = await runManifestBuild(this.appPath, {
        writeOutput: false,
      });

      // Notify with generation for new API
      if (this.callbacks.onBuildComplete) {
        this.callbacks.onBuildComplete(generation, result);
      }

      // Legacy callback support
      if (result.manifest) {
        logger.log('👀 Watching for changes...');
        await this.callbacks.onBuildSuccess?.(result);
      }
    });

    // Initial build uses generation 0
    const initialGeneration = this.callbacks.onChangeDetected?.() ?? 0;
    // Don't write manifest here - the orchestrator will write it
    // after checksums are populated by the file watchers
    const result = await runManifestBuild(this.appPath, {
      writeOutput: false,
    });

    if (this.callbacks.onBuildComplete) {
      this.callbacks.onBuildComplete(initialGeneration, result);
    }

    // Legacy callback support for initial build
    if (result.manifest) {
      await this.callbacks.onBuildSuccess?.(result);
    }

    logger.log('📂 Watcher started');
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }
}
