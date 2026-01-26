import chokidar, { type FSWatcher } from 'chokidar';

export type ManifestWatcherOptions = {
  appPath: string;
  onChangeDetected: (filePath: string) => void;
};

export class ManifestWatcher {
  private appPath: string;
  private onChangeDetected: (filePath: string) => void;
  private watcher: FSWatcher | null = null;

  constructor(options: ManifestWatcherOptions) {
    this.appPath = options.appPath;
    this.onChangeDetected = options.onChangeDetected;
  }

  async start(): Promise<void> {
    this.watcher = chokidar.watch(this.appPath, {
      ignored: [/node_modules/, /dist/, /\.twenty/],
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
      this.onChangeDetected(filePath);
    });
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }
}
