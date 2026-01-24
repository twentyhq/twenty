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
   */
  onChangeDetected?: () => void;
  /**
   * Called when the manifest build completes (success or failure).
   */
  onBuildComplete?: (result: ManifestBuildResult) => void;
};

export type ManifestWatcherOptions = {
  appPath: string;
  callbacks?: ManifestWatcherCallbacks;
};

/**
 * Watches for file changes and rebuilds the manifest.
 */
export class ManifestWatcher {
  private appPath: string;
  private callbacks: ManifestWatcherCallbacks;
  private watcher: FSWatcher | null = null;

  constructor(options: ManifestWatcherOptions) {
    this.appPath = options.appPath;
    this.callbacks = options.callbacks ?? {};
  }

  async start(): Promise<void> {
    // Set up file watcher
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
      // Only watch TypeScript and JSON files
      if (!filePath.match(/\.(ts|tsx|json)$/)) {
        return;
      }

      // Ignore our own output
      if (filePath.includes('.twenty')) {
        return;
      }

      const relativePath = path.relative(this.appPath, filePath);
      logger.log(`File ${event}: ${relativePath}`);

      // Notify change detected
      this.callbacks.onChangeDetected?.();

      // Rebuild manifest
      const result = await runManifestBuild(this.appPath, {
        writeOutput: false,
      });

      this.callbacks.onBuildComplete?.(result);
    });

    // Initial build
    logger.log('📂 Starting initial build...');
    this.callbacks.onChangeDetected?.();

    const result = await runManifestBuild(this.appPath, {
      writeOutput: false,
    });

    this.callbacks.onBuildComplete?.(result);
    logger.log('📂 Watcher started');
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }
}
