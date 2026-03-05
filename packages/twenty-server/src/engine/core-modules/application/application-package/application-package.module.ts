import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/services/application-package-fetcher.service';
import { ApplicationTarballService } from 'src/engine/core-modules/application/application-package/services/application-tarball.service';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    FileStorageModule,
    TwentyConfigModule,
  ],
  providers: [ApplicationPackageFetcherService, ApplicationTarballService],
  exports: [ApplicationPackageFetcherService, ApplicationTarballService],
})
export class ApplicationPackageModule {}
