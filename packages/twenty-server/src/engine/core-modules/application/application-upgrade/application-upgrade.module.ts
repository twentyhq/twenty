import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { ApplicationManifestModule } from 'src/engine/core-modules/application/application-manifest/application-manifest.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationUpgradeResolver } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.resolver';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { UpgradeApplicationCommand } from 'src/engine/core-modules/application/application-upgrade/commands/upgrade-application.command';
import { WorkspaceVersionModule } from 'src/engine/workspace-manager/workspace-version/workspace-version.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';

@Module({
  imports: [
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationRegistrationEntity,
    ]),
    ApplicationInstallModule,
    ApplicationManifestModule,
    ApplicationPackageModule,
    PermissionsModule,
    WorkspaceVersionModule,
  ],
  providers: [
    ApplicationUpgradeService,
    ApplicationUpgradeResolver,
    UpgradeApplicationCommand,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [ApplicationUpgradeService],
})
export class ApplicationUpgradeModule {}
