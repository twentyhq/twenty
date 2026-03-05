import chokidar, { type FSWatcher } from 'chokidar';
import crypto from 'crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join, relative } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { type FileFolder } from 'twenty-shared/types';

import {
  copy,
  ensureDir,
  pathExists,
  remove,
} from '@/cli/utilities/file/fs-utils';

export type AssetWatcherOptions = {
  appPath: string;
  fileFolder: FileFolder;
  watchPaths: string[];
  handleFileBuilt: (options: {
    fileFolder: FileFolder;
    builtPath: string;
    sourcePath: string;
    checksum: string;
  }) => void;
};

export class FileUploadWatcher {
  private appPath: string;
  private watcher: FSWatcher | null = null;
  private fileFolder: FileFolder;
  private watchPaths: string[];
  private handleFileBuilt: AssetWatcherOptions['handleFileBuilt'];

  constructor(options: AssetWatcherOptions) {
    this.appPath = options.appPath;
    this.fileFolder = options.fileFolder;
    this.watchPaths = options.watchPaths;
    this.handleFileBuilt = options.handleFileBuilt;
  }

  async start(): Promise<void> {
    const rootPaths = this.watchPaths.map((watchPath) =>
      join(this.appPath, watchPath),
    );

    for (const rootPath of rootPaths) {
      const exists = await pathExists(rootPath);
      if (!exists) {
        return;
      }
    }

    this.watcher = chokidar.watch(rootPaths, {
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('all', (event, filePath) => {
      if (event === 'addDir' || event === 'unlinkDir') {
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
    const sourcePath = relative(this.appPath, absoluteFilePath);
    const outputPath = join(OUTPUT_DIR, sourcePath);
    const absoluteOutputPath = join(this.appPath, outputPath);

    await ensureDir(dirname(absoluteOutputPath));
    await copy(absoluteFilePath, absoluteOutputPath);

    const content = await readFile(absoluteOutputPath);
    const checksum = crypto.createHash('md5').update(content).digest('hex');

    this.handleFileBuilt({
      fileFolder: this.fileFolder,
      builtPath: outputPath,
      sourcePath,
      checksum,
    });
  }

  private async handleUnlink(absoluteFilePath: string): Promise<void> {
    const sourcePath = relative(this.appPath, absoluteFilePath);
    const builtPath = join(OUTPUT_DIR, sourcePath);
    const absoluteBuiltPath = join(this.appPath, builtPath);

    await remove(absoluteBuiltPath);
  }
}
