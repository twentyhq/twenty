import { createReadStream, existsSync, realpathSync } from 'fs';
import * as fs from 'fs/promises';
import path, { dirname, join } from 'path';
import { type Readable } from 'stream';

import { isObject } from '@sniptt/guards';
import { type Sources } from 'twenty-shared/types';

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

  async createFolder(path: string) {
    return fs.mkdir(path, { recursive: true });
  }

  async write(params: {
    filePath: string;
    sourceFile: Buffer | Uint8Array | string;
    mimeType: string | undefined;
  }): Promise<void> {
    const filePath = `${this.options.storagePath}/${params.filePath}`;
    const folderPath = dirname(filePath);

    await this.createFolder(folderPath);

    await fs.writeFile(filePath, params.sourceFile);
  }

  async writeFolder(sources: Sources, folderPath: string) {
    for (const key of Object.keys(sources)) {
      if (isObject(sources[key])) {
        await this.writeFolder(sources[key], join(folderPath, key));
        continue;
      }
      await this.write({
        filePath: join(folderPath, key),
        sourceFile: sources[key],
        mimeType: undefined,
      });
    }
  }

  async delete(params: {
    folderPath: string;
    filename?: string;
  }): Promise<void> {
    const filePath = join(
      `${this.options.storagePath}/`,
      params.folderPath,
      params.filename || '',
    );

    await fs.rm(filePath, { recursive: true });
  }

  async read(params: { filePath: string }): Promise<Readable> {
    const joinedPath = join(`${this.options.storagePath}/`, params.filePath);
    let filePath: string;

    try {
      filePath = realpathSync(path.resolve(joinedPath));
    } catch {
      throw new FileStorageException(
        'File not found',
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }
    const storageRoot = realpathSync(path.resolve(this.options.storagePath));

    if (!filePath.startsWith(storageRoot + path.sep)) {
      // Prevent directory traversal
      throw new FileStorageException(
        'Access denied',
        FileStorageExceptionCode.FILE_NOT_FOUND,
      );
    }

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

  async readFolder(folderPath: string): Promise<Sources> {
    const sources: Sources = {};

    const rootFolderPath = join(`${this.options.storagePath}/`, folderPath);

    const resources = await fs.readdir(rootFolderPath);

    for (const resource of resources) {
      const resourcePath = path.join(rootFolderPath, resource);

      const stats = await fs.stat(resourcePath);

      if (stats.isFile()) {
        sources[resource] = await fs.readFile(resourcePath, 'utf8');
      } else {
        sources[resource] = await this.readFolder(
          path.join(folderPath, resource),
        );
      }
    }

    return sources;
  }

  async move(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const fromPath = join(
      `${this.options.storagePath}/`,
      params.from.folderPath,
      params.from.filename || '',
    );

    const toPath = join(
      `${this.options.storagePath}/`,
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

  async copy(
    params: {
      from: { folderPath: string; filename?: string };
      to: { folderPath: string; filename?: string };
    },
    toInMemory = false,
  ): Promise<void> {
    if (!params.from.filename && params.to.filename) {
      throw new Error('Cannot copy folder to file');
    }
    const fromPath = join(
      this.options.storagePath,
      params.from.folderPath,
      params.from.filename || '',
    );

    const toPath = join(
      toInMemory ? '' : this.options.storagePath,
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

  async download(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    await this.copy(params, true);
  }

  async checkFileExists(params: {
    folderPath: string;
    filename: string;
  }): Promise<boolean> {
    const filePath = join(
      this.options.storagePath,
      params.folderPath,
      params.filename,
    );

    return existsSync(filePath);
  }

  async checkFolderExists(folderPath: string): Promise<boolean> {
    const folderFullPath = join(this.options.storagePath, folderPath);

    return existsSync(folderFullPath);
  }
}
