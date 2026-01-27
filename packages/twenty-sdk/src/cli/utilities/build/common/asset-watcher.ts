import chokidar, { type FSWatcher } from 'chokidar';
import crypto from 'crypto';
import * as fs from 'fs-extra';
import path from 'path';
import { FileFolder } from 'twenty-shared/types';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';

const ASSETS_DIR = 'assets';

export type AssetWatcherOptions = {
  appPath: string;
  handleFileBuilt: (options: {
    fileFolder: FileFolder;
    builtPath: string;
    sourcePath: string;
    checksum: string;
  }) => void;
  handleAssetDeleted?: (sourcePath: string) => void;
};

export class AssetWatcher {
  private appPath: string;
  private watcher: FSWatcher | null = null;
  private handleFileBuilt: AssetWatcherOptions['handleFileBuilt'];
  private handleAssetDeleted?: AssetWatcherOptions['handleAssetDeleted'];

  constructor(options: AssetWatcherOptions) {
    this.appPath = options.appPath;
    this.handleFileBuilt = options.handleFileBuilt;
    this.handleAssetDeleted = options.handleAssetDeleted;
  }

  async start(): Promise<void> {
    const assetsPath = path.join(this.appPath, ASSETS_DIR);

    const exists = await fs.pathExists(assetsPath);

    if (!exists) {
      return;
    }

    this.watcher = chokidar.watch(assetsPath, {
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
      usePolling: true,
    });

    this.watcher.on('all', (event, filePath) => {
      if (event === 'addDir') {
        return;
      }

      if (event === 'add' || event === 'change') {
        void this.copyAndNotify(filePath);
      }

      if (event === 'unlink') {
        void this.handleUnlink(filePath);
      }
    });
  }

  async close(): Promise<void> {
    await this.watcher?.close();
  }

  private async copyAndNotify(absoluteFilePath: string): Promise<void> {
    const sourcePath = path.relative(this.appPath, absoluteFilePath);
    const outputPath = path.join(OUTPUT_DIR, sourcePath);
    const absoluteOutputPath = path.join(this.appPath, outputPath);

    await fs.ensureDir(path.dirname(absoluteOutputPath));
    await fs.copy(absoluteFilePath, absoluteOutputPath);

    const content = await fs.readFile(absoluteOutputPath);
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    this.handleFileBuilt({
      fileFolder: FileFolder.Asset,
      builtPath: outputPath,
      sourcePath,
      checksum,
    });
  }

  private async handleUnlink(absoluteFilePath: string): Promise<void> {
    const sourcePath = path.relative(this.appPath, absoluteFilePath);
    const builtPath = path.join(OUTPUT_DIR, sourcePath);
    const absoluteBuiltPath = path.join(this.appPath, builtPath);

    await fs.remove(absoluteBuiltPath);

    this.handleAssetDeleted?.(sourcePath);
  }
}
