import { relative } from 'path';
import chokidar, { type FSWatcher } from 'chokidar';
import { type EventName } from 'chokidar/handler.js';
import { ASSETS_DIR } from 'twenty-shared/application';

export type ManifestWatcherOptions = {
  appPath: string;
  handleChangeDetected: (filePath: string) => void;
};

export class ManifestWatcher {
  private appPath: string;
  private handleChangeDetected: (filePath: string, event: EventName) => void;
  private watcher: FSWatcher | null = null;

  constructor(options: ManifestWatcherOptions) {
    this.appPath = options.appPath;
    this.handleChangeDetected = options.handleChangeDetected;
  }

  async start(): Promise<void> {
    this.watcher = chokidar.watch(this.appPath, {
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
      usePolling: true,
    });

    this.watcher.on('all', async (event, filePath) => {
      if (event === 'addDir') {
        return;
      }

      const relativePath = relative(this.appPath, filePath);

      const isInIgnoredDir =
        relativePath.startsWith('node_modules') ||
        relativePath.startsWith('generated') ||
        relativePath.startsWith('dist');

      const isAssetFile = relativePath.startsWith(ASSETS_DIR);

      const isDependencyFile = ['package.json', 'yarn.lock'].includes(
        relativePath,
      );

      const isTypeScriptFile =
        relativePath.endsWith('.ts') || relativePath.endsWith('.tsx');

      const isHiddenFile = relativePath.startsWith('.');

      const shouldIgnore = isInIgnoredDir || !isTypeScriptFile || isHiddenFile;

      if (shouldIgnore && !isAssetFile && !isDependencyFile) {
        return;
      }

      this.handleChangeDetected(relativePath, event);
    });
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }
}
