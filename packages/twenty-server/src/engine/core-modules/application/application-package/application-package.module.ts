import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [
    FileStorageModule,
    TwentyConfigModule,
    TypeOrmModule.forFeature([FileEntity, ApplicationEntity]),
  ],
  providers: [ApplicationPackageFetcherService],
  exports: [ApplicationPackageFetcherService],
})
export class ApplicationPackageModule {}
