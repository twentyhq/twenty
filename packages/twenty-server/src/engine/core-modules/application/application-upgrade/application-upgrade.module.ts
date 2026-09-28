import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { ApplicationPackageModule } from 'src/engine/core-modules/application/application-package/application-package.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationModule } from 'src/engine/core-modules/application/application-registration/application-registration.module';
import { ApplicationUpgradeResolver } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.resolver';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { UpgradeApplicationCommand } from 'src/engine/core-modules/application/application-upgrade/commands/upgrade-application.command';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { WorkspaceVersionModule } from 'src/engine/workspace-manager/workspace-version/workspace-version.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationRegistrationEntity,
    ]),
    ApplicationInstallModule,
    ApplicationPackageModule,
    // Nothing here injects from these two modules any more, but the generated
    // metadata GraphQL schema follows Nest's module registration order, so
    // dropping them reorders the checked-in client schema.
    ApplicationRegistrationModule,
    FeatureFlagModule,
    PermissionsModule,
    TwentyConfigModule,
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
