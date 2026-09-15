import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationUpgradeResolver } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.resolver';
import { ApplicationUpgradeService } from 'src/engine/core-modules/application/application-upgrade/application-upgrade.service';
import { UpgradeApplicationCommand } from 'src/engine/core-modules/application/application-upgrade/commands/upgrade-application.command';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceVersionModule } from 'src/engine/workspace-manager/workspace-version/workspace-version.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntity,
      ApplicationRegistrationEntity,
    ]),
    ApplicationInstallModule,
    FeatureFlagModule,
    PermissionsModule,
    WorkspaceIteratorModule,
    WorkspaceVersionModule,
  ],
  providers: [
    ApplicationUpgradeService,
    ApplicationUpgradeResolver,
    UpgradeApplicationCommand,
  ],
  exports: [ApplicationUpgradeService],
})
export class ApplicationUpgradeModule {}
