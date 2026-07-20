import { type DynamicModule, Global } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileStorageExceptionFilter } from 'src/engine/core-modules/file-storage/file-storage-exception-filter';
import { FileStorageDriverFactory } from 'src/engine/core-modules/file-storage/file-storage-driver.factory';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { ServerFileStorageService } from 'src/engine/core-modules/file-storage/services/server-file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
@Global()
export class FileStorageModule {
  static forRoot(): DynamicModule {
    return {
      module: FileStorageModule,
      imports: [
        TwentyConfigModule,
        TypeOrmModule.forFeature([FileEntity]),
        WorkspaceCacheModule,
      ],
      providers: [
        FileStorageDriverFactory,
        FileStorageService,
        ServerFileStorageService,
        provideWorkspaceScopedRepository(FileEntity),
        {
          provide: APP_FILTER,
          useClass: FileStorageExceptionFilter,
        },
      ],
      exports: [
        FileStorageDriverFactory,
        FileStorageService,
        ServerFileStorageService,
      ],
    };
  }
}
