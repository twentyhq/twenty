import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { S3DriverOptions } from 'src/engine/core-modules/file-storage/drivers/s3.driver';
import { LocalDriverOptions } from 'src/engine/core-modules/file-storage/drivers/local.driver';

export enum StorageDriverType {
  S3 = 's3',
  Local = 'local',
}

export interface S3DriverFactoryOptions {
  type: StorageDriverType.S3;
  options: S3DriverOptions;
}

export interface LocalDriverFactoryOptions {
  type: StorageDriverType.Local;
  options: LocalDriverOptions;
}

export type FileStorageModuleOptions =
  | S3DriverFactoryOptions
  | LocalDriverFactoryOptions;

export type FileStorageModuleAsyncOptions = {
  useFactory: (
    ...args: any[]
  ) => FileStorageModuleOptions | Promise<FileStorageModuleOptions>;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;
