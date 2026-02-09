import { type Readable } from 'stream';

import { type StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';

import { assertStoragePathIsSafe } from 'src/engine/core-modules/file-storage/utils/assert-storage-path-is-safe.util';

export class ValidatedStorageDriver implements StorageDriver {
  constructor(private readonly delegate: StorageDriver) {}

  async readFile(params: { filePath: string }): Promise<Readable> {
    assertStoragePathIsSafe(params.filePath);

    return this.delegate.readFile(params);
  }

  async writeFile(params: {
    filePath: string;
    sourceFile: Buffer | Uint8Array | string;
    mimeType: string | undefined;
  }): Promise<void> {
    assertStoragePathIsSafe(params.filePath);

    return this.delegate.writeFile(params);
  }

  async downloadFolder(params: {
    onStoragePath: string;
    localPath: string;
  }): Promise<void> {
    assertStoragePathIsSafe(params.onStoragePath);

    return this.delegate.downloadFolder(params);
  }

  async uploadFolder(params: {
    localPath: string;
    onStoragePath: string;
  }): Promise<void> {
    assertStoragePathIsSafe(params.onStoragePath);

    return this.delegate.uploadFolder(params);
  }

  async downloadFile(params: {
    onStoragePath: string;
    localPath: string;
  }): Promise<void> {
    assertStoragePathIsSafe(params.onStoragePath);

    return this.delegate.downloadFile(params);
  }

  async delete(params: {
    folderPath: string;
    filename?: string;
  }): Promise<void> {
    assertStoragePathIsSafe(params.folderPath);

    if (params.filename) {
      assertStoragePathIsSafe(params.filename);
    }

    return this.delegate.delete(params);
  }

  async move(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    assertStoragePathIsSafe(params.from.folderPath);
    assertStoragePathIsSafe(params.to.folderPath);

    if (params.from.filename) {
      assertStoragePathIsSafe(params.from.filename);
    }

    if (params.to.filename) {
      assertStoragePathIsSafe(params.to.filename);
    }

    return this.delegate.move(params);
  }

  async copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    assertStoragePathIsSafe(params.from.folderPath);
    assertStoragePathIsSafe(params.to.folderPath);

    if (params.from.filename) {
      assertStoragePathIsSafe(params.from.filename);
    }

    if (params.to.filename) {
      assertStoragePathIsSafe(params.to.filename);
    }

    return this.delegate.copy(params);
  }

  async checkFileExists(params: { filePath: string }): Promise<boolean> {
    assertStoragePathIsSafe(params.filePath);

    return this.delegate.checkFileExists(params);
  }

  async checkFolderExists(params: { folderPath: string }): Promise<boolean> {
    assertStoragePathIsSafe(params.folderPath);

    return this.delegate.checkFolderExists(params);
  }
}
