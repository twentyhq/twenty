import { Inject, Injectable } from '@nestjs/common';

import { Readable } from 'stream';

import { StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';

import { STORAGE_DRIVER } from 'src/engine/core-modules/file-storage/file-storage.constants';

@Injectable()
export class FileStorageService implements StorageDriver {
  constructor(@Inject(STORAGE_DRIVER) private driver: StorageDriver) {}

  delete(params: { folderPath: string; filename?: string }): Promise<void> {
    return this.driver.delete(params);
  }

  write(params: {
    file: string | Buffer | Uint8Array;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void> {
    return this.driver.write(params);
  }

  read(params: { folderPath: string; filename: string }): Promise<Readable> {
    return this.driver.read(params);
  }

  move(params: {
    from: { folderPath: string; filename: string };
    to: { folderPath: string; filename: string };
  }): Promise<void> {
    return this.driver.move(params);
  }

  copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    return this.driver.copy(params);
  }

  download(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    return this.driver.download(params);
  }
}
