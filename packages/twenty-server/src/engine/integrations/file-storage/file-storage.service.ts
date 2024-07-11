import { Inject, Injectable } from '@nestjs/common';

import { Readable } from 'stream';

import { STORAGE_DRIVER } from './file-storage.constants';

import { StorageDriver } from './drivers/interfaces/storage-driver.interface';

@Injectable()
export class FileStorageService implements StorageDriver {
  constructor(@Inject(STORAGE_DRIVER) private driver: StorageDriver) {}

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

  async readContent(stream: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      stream.on('error', (err) => reject(err));
    });
  }
}
