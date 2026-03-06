import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationInstallResolver } from 'src/engine/core-modules/application/application-install/application-install.resolver';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationModule,
    ApplicationManifestModule,
    ApplicationPackageModule,
    CacheLockModule,
    FeatureFlagModule,
    PermissionsModule,
    FileStorageModule,
  ],
  providers: [ApplicationInstallResolver, ApplicationInstallService],
  exports: [ApplicationInstallService],
})
export class ApplicationInstallModule {}
