import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationPackageResolverService } from 'src/engine/core-modules/application/application-package/services/application-package-resolver.service';
import { ApplicationTarballService } from 'src/engine/core-modules/application/application-package/services/application-tarball.service';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    FileStorageModule,
    TwentyConfigModule,
  ],
  providers: [ApplicationPackageResolverService, ApplicationTarballService],
  exports: [ApplicationPackageResolverService, ApplicationTarballService],
})
export class ApplicationPackageModule {}
