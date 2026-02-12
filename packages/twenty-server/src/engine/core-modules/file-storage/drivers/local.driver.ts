import { createReadStream, existsSync, realpathSync } from 'fs';
import * as fs from 'fs/promises';
import path, { dirname, join } from 'path';
import { type Readable } from 'stream';

import { type StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';

export interface LocalDriverOptions {
  storagePath: string;
}

export class LocalDriver implements StorageDriver {
  private options: LocalDriverOptions;

  constructor(options: LocalDriverOptions) {
    this.options = options;
  }

  private async createFolder(folderPath: string) {
    return fs.mkdir(folderPath, { recursive: true });
  }

  private assertRealPathIsWithinStorage(realPath: string): void {
    const storageRoot = realpathSync(path.resolve(this.options.storagePath));

    if (!realPath.startsWith(storageRoot + path.sep)) {
      throw new FileStorageException(
        'Access denied',
        FileStorageExceptionCode.ACCESS_DENIED,
      );
    }
  }

  async readFile(params: { filePath: string }): Promise<Readable> {
    const joinedPath = join(this.options.storagePath, params.filePath);
    let filePath: string;

    try {
      filePath = realpathSync(path.resolve(joinedPath));
    } catch {
      throw new FileStorageException(
        'File not found',
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

    this.assertRealPathIsWithinStorage(filePath);

    try {
      return createReadStream(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileStorageException(
          'File not found',
          FileStorageExceptionCode.FILE_NOT_FOUND,
        );
      }

      throw error;
    }
  }

  async writeFile(params: {
    filePath: string;
    sourceFile: Buffer | Uint8Array | string;
    mimeType: string | undefined;
  }): Promise<void> {
    const filePath = path.resolve(this.options.storagePath, params.filePath);
    const folderPath = dirname(filePath);

    await this.createFolder(folderPath);

    await fs.writeFile(filePath, params.sourceFile);
  }

  async downloadFile(params: {
    onStoragePath: string;
    localPath: string;
  }): Promise<void> {
    const filePath = path.resolve(
      this.options.storagePath,
      params.onStoragePath,
    );

    await this.createFolder(dirname(params.localPath));

    const content = await fs.readFile(filePath);

    await fs.writeFile(params.localPath, content);
  }

  async downloadFolder(params: {
    onStoragePath: string;
    localPath: string;
  }): Promise<void> {
    const rootFolderPath = path.resolve(
      this.options.storagePath,
      params.onStoragePath,
    );

    await this.createFolder(params.localPath);

    const resources = await fs.readdir(rootFolderPath);

    for (const resource of resources) {
      const resourcePath = path.join(rootFolderPath, resource);
      const stats = await fs.stat(resourcePath);

      if (stats.isFile()) {
        const content = await fs.readFile(resourcePath);

        await fs.writeFile(path.join(params.localPath, resource), content);
      } else {
        await this.downloadFolder({
          onStoragePath: path.join(params.onStoragePath, resource),
          localPath: path.join(params.localPath, resource),
        });
      }
    }
  }

  async uploadFolder(params: {
    localPath: string;
    onStoragePath: string;
  }): Promise<void> {
    const resources = await fs.readdir(params.localPath);

    for (const resource of resources) {
      const resourcePath = path.join(params.localPath, resource);
      const stats = await fs.stat(resourcePath);

      if (stats.isFile()) {
        const content = await fs.readFile(resourcePath);

        await this.writeFile({
          filePath: path.join(params.onStoragePath, resource),
          sourceFile: content,
          mimeType: undefined,
        });
      } else {
        await this.uploadFolder({
          localPath: resourcePath,
          onStoragePath: path.join(params.onStoragePath, resource),
        });
      }
    }
  }

  async delete(params: {
    folderPath: string;
    filename?: string;
  }): Promise<void> {
    const filePath = path.resolve(
      this.options.storagePath,
      params.folderPath,
      params.filename || '',
    );

    await fs.rm(filePath, { recursive: true, force: true });
  }

  async move(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const fromPath = path.resolve(
      this.options.storagePath,
      params.from.folderPath,
      params.from.filename || '',
    );

    const toPath = path.resolve(
      this.options.storagePath,
      params.to.folderPath,
      params.to.filename || '',
    );

    await this.createFolder(dirname(toPath));

    try {
      await fs.rename(fromPath, toPath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileStorageException(
          'File not found',
          FileStorageExceptionCode.FILE_NOT_FOUND,
        );
      }

      throw error;
    }
  }

  async copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    if (!params.from.filename && params.to.filename) {
      throw new Error('Cannot copy folder to file');
    }

    const fromPath = path.resolve(
      this.options.storagePath,
      params.from.folderPath,
      params.from.filename || '',
    );

    const toPath = path.resolve(
      this.options.storagePath,
      params.to.folderPath,
      params.to.filename || '',
    );

    await this.createFolder(dirname(toPath));

    try {
      await fs.cp(fromPath, toPath, { recursive: true });
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileStorageException(
          'File not found',
          FileStorageExceptionCode.FILE_NOT_FOUND,
        );
      }

      throw error;
    }
  }

  async checkFileExists(params: { filePath: string }): Promise<boolean> {
    const fullPath = path.resolve(this.options.storagePath, params.filePath);

    return existsSync(fullPath);
  }

  async checkFolderExists(params: { folderPath: string }): Promise<boolean> {
    const folderFullPath = path.resolve(
      this.options.storagePath,
      params.folderPath,
    );

    return existsSync(folderFullPath);
  }
}
