import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { MarketplaceModule } from 'src/engine/core-modules/application/application-marketplace/marketplace.module';
import { ApplicationInstallResolver } from 'src/engine/core-modules/application/application-install/application-install.resolver';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { LogicFunctionModule } from 'src/engine/core-modules/logic-function/logic-function.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { SdkClientModule } from 'src/engine/core-modules/sdk-client/sdk-client.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationModule,
    ApplicationRegistrationModule,
    ApplicationManifestModule,
    ApplicationPackageModule,
    MarketplaceModule,
    CacheLockModule,
    FeatureFlagModule,
    LogicFunctionModule,
    MetricsModule,
    SdkClientModule,
    PermissionsModule,
    FileStorageModule,
    WorkspaceCacheModule,
  ],
  providers: [ApplicationInstallResolver, ApplicationInstallService],
  exports: [ApplicationInstallService],
})
export class ApplicationInstallModule {}
