import { Injectable } from '@nestjs/common';

import { Readable } from 'stream';

import { StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';

import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';

@Injectable()
export class FileStorageService implements StorageDriver {
  constructor(
    private readonly fileStorageDriverFactory: FileStorageDriverFactory,
  ) {}

  write(params: {
    file: string | Buffer | Uint8Array;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.write(params);
  }

  read(params: { folderPath: string; filename: string }): Promise<Readable> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.read(params);
  }

  delete(params: { folderPath: string; filename?: string }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.delete(params);
  }

  move(params: {
    from: { folderPath: string; filename: string };
    to: { folderPath: string; filename: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.move(params);
  }

  copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.copy(params);
  }

  download(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.download(params);
  }

  checkFileExists(params: {
    folderPath: string;
    filename: string;
  }): Promise<boolean> {
    const driver = this.fileStorageDriverFactory.getCurrentDriver();

    return driver.checkFileExists(params);
  }
}
