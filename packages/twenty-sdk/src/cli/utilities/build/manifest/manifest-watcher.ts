import chokidar, { type FSWatcher } from 'chokidar';
import { type EventName } from 'chokidar/handler.js';

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
      this.handleChangeDetected(filePath, event);
    });
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }
}
