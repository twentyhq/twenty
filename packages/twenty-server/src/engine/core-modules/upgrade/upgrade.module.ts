import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { RegisteredInstanceMigrationService } from 'src/engine/core-modules/upgrade/services/registered-instance-migration-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    DiscoveryModule,
    TypeOrmModule.forFeature([UpgradeMigrationEntity, WorkspaceEntity]),
  ],
  providers: [
    UpgradeMigrationService,
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    RegisteredInstanceMigrationService,
  ],
  exports: [
    UpgradeMigrationService,
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    RegisteredInstanceMigrationService,
  ],
})
export class UpgradeModule {}
