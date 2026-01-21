import chalk from 'chalk';
import chokidar, { type FSWatcher } from 'chokidar';
import * as fs from 'fs-extra';
import path from 'path';
import { printWatchingMessage } from '../common/display';
import { runManifestBuild, type ManifestBuildResult } from './manifest-build';

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
    const srcPath = path.join(this.appPath, 'src');
    const hasSrcFolder = await fs.pathExists(srcPath);
    const watchPath = hasSrcFolder ? srcPath : this.appPath;

    this.watcher = chokidar.watch(watchPath, {
      ignored: ['**/node_modules/**', '**/.twenty/**', '**/dist/**'],
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

      console.log(chalk.gray(`  File ${event}: ${path.relative(this.appPath, filePath)}`));

      const result = await runManifestBuild(this.appPath);

      if (result) {
        printWatchingMessage();
        this.callbacks.onBuildSuccess?.(result);
      }
    });

    console.log(chalk.gray('  📂 Manifest watcher started'));
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }
}
