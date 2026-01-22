import chokidar, { type FSWatcher } from 'chokidar';
import path from 'path';
import { createLogger } from '../common/logger';
import { runManifestBuild, type ManifestBuildResult } from './manifest-build';

const logger = createLogger('manifest-watch');

export type ManifestWatcherCallbacks = {
  onBuildSuccess?: (result: ManifestBuildResult) => void;
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
        (filePath: string) => filePath.includes('/.twenty/') || filePath.includes('\\.twenty\\'),
      ],
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('all', async (event, filePath) => {
      if (!filePath.match(/\.(ts|tsx|json)$/)) {
        return;
      }

      // Double-check to prevent watching our own output
      if (filePath.includes('.twenty')) {
        return;
      }

      logger.log(`File ${event}: ${path.relative(this.appPath, filePath)}`);

      const result = await runManifestBuild(this.appPath);

      if (result.manifest) {
        logger.log('👀 Watching for changes...');
        this.callbacks.onBuildSuccess?.(result);
      }
    });

    logger.log('📂 Watcher started');
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }
}
