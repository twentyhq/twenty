import { DynamicModule, Global } from '@nestjs/common';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import {
  FileStorageModuleAsyncOptions,
  FileStorageModuleOptions,
} from 'src/engine/core-modules/file-storage/interfaces';
import { STORAGE_DRIVER } from 'src/engine/core-modules/file-storage/file-storage.constants';
import { LocalDriver } from 'src/engine/core-modules/file-storage/drivers/local.driver';
import { S3Driver } from 'src/engine/core-modules/file-storage/drivers/s3.driver';

@Global()
export class FileStorageModule {
  static forRoot(options: FileStorageModuleOptions): DynamicModule {
    const provider = {
      provide: STORAGE_DRIVER,
      useValue:
        options.type === 's3'
          ? new S3Driver(options.options)
          : new LocalDriver(options.options),
    };

    return {
      module: FileStorageModule,
      providers: [FileStorageService, provider],
      exports: [FileStorageService],
    };
  }

  static forRootAsync(options: FileStorageModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: STORAGE_DRIVER,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        return config?.type === 's3'
          ? new S3Driver(config.options)
          : new LocalDriver(config.options);
      },
      inject: options.inject || [],
    };

    return {
      module: FileStorageModule,
      imports: options.imports || [],
      providers: [FileStorageService, provider],
      exports: [FileStorageService],
    };
  }
}
