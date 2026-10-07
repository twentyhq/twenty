import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { CacheLockModule } from 'src/engine/core-modules/cache-lock/cache-lock.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { MarketplaceModule } from 'src/engine/core-modules/application/application-marketplace/marketplace.module';
import { ApplicationInstallResolver } from 'src/engine/core-modules/application/application-install/application-install.resolver';
import { ApplicationCapabilityResolver } from 'src/engine/core-modules/application/application-install/application-capability.resolver';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { InstallApplicationCommand } from 'src/engine/core-modules/application/application-install/commands/install-application.command';
import { ApplicationLifecycleJobService } from 'src/engine/core-modules/application/application-install/services/application-lifecycle-job.service';
import { ApplicationUninstallRunnerService } from 'src/engine/core-modules/application/application-install/services/application-uninstall-runner.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';

@Module({
  imports: [
    ApplicationRegistrationLookupModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationRegistrationEntity,
    ]),
    ApplicationLookupModule,
    ApplicationModule,
    ApplicationManifestModule,
    ApplicationPackageModule,
    MarketplaceModule,
    CacheLockModule,
    MetricsModule,
    PermissionsModule,
    WorkspaceCacheModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    ApplicationCapabilityResolver,
    ApplicationInstallResolver,
    ApplicationInstallService,
    ApplicationLifecycleJobService,
    ApplicationUninstallRunnerService,
    InstallApplicationCommand,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [ApplicationInstallService, ApplicationUninstallRunnerService],
})
export class ApplicationInstallModule {}
