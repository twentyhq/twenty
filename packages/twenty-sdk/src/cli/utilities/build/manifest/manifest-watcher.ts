import path, { relative } from 'path';
import chokidar, { type FSWatcher } from 'chokidar';
import { ASSETS_DIR } from 'twenty-shared/application';
import { type ChokidarFsEvent } from '@/cli/types';

export type ManifestWatcherOptions = {
  appPath: string;
  handleChangeDetected: (filePath: string) => void;
  verbose?: boolean;
};

const IGNORED_DIRECTORY_NAMES = new Set(['node_modules', 'dist', '.twenty']);

export class ManifestWatcher {
  private appPath: string;
  private handleChangeDetected: (
    filePath: string,
    event: ChokidarFsEvent,
  ) => void;
  private verbose: boolean;
  private watcher: FSWatcher | null = null;

  constructor(options: ManifestWatcherOptions) {
    this.appPath = options.appPath;
    this.handleChangeDetected = options.handleChangeDetected;
    this.verbose = options.verbose ?? false;
  }

  async start(): Promise<void> {
    const appPath = this.appPath;

    this.watcher = chokidar.watch(this.appPath, {
      ignoreInitial: !this.verbose,
      ignored: (filePath: string) => {
        const relativePath = relative(appPath, filePath);

        if (relativePath === '') {
          return false;
        }

        const firstSegment = relativePath.split(path.sep)[0];

        return (
          IGNORED_DIRECTORY_NAMES.has(firstSegment) ||
          firstSegment.startsWith('.')
        );
      },
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('all', (event, filePath) => {
      if (event === 'addDir' || event === 'unlinkDir') {
        return;
      }

      const relativePath = relative(this.appPath, filePath);

      const isAssetFile = relativePath.startsWith(ASSETS_DIR);

      const isDependencyFile = ['package.json', 'yarn.lock'].includes(
        relativePath,
      );

      const isTypeScriptFile =
        relativePath.endsWith('.ts') || relativePath.endsWith('.tsx');

      if (!isTypeScriptFile && !isAssetFile && !isDependencyFile) {
        return;
      }

      this.handleChangeDetected(relativePath, event);
    });
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }
}
