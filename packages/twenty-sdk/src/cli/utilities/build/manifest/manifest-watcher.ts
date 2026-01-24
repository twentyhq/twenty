import chokidar, { type FSWatcher } from 'chokidar';
import {
  type ManifestBuildResult,
  runManifestBuild,
} from '@/cli/utilities/build/manifest/manifest-build';
import { devUIState } from '@/cli/utilities/dev/dev-ui-state';
import { relative } from 'path';

export type ManifestWatcherCallbacks = {
  /**
   * Called when a file change is detected, BEFORE the manifest build starts.
   */
  onChangeDetected?: (filePath?: string) => void;
  /**
   * Called when the manifest build completes (success or failure).
   */
  onBuildComplete?: (result: ManifestBuildResult, filePath?: string) => void;
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

      // Emit file change event for the UI
      devUIState.fileChanged(filePath);
      devUIState.fileBuilding(filePath);
      devUIState.manifestBuilding();

      const relativePath = relative(this.appPath, filePath);

      // Notify change detected
      this.callbacks.onChangeDetected?.(relativePath);

      // Rebuild manifest
      const result = await runManifestBuild(this.appPath, {
        display: false,
        writeOutput: false,
      });

      this.callbacks.onBuildComplete?.(result, relativePath);
    });

    // Initial build
    devUIState.manifestBuilding();
    this.callbacks.onChangeDetected?.();

    const result = await runManifestBuild(this.appPath, {
      display: false,
      writeOutput: false,
    });

    this.callbacks.onBuildComplete?.(result);
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }
}
