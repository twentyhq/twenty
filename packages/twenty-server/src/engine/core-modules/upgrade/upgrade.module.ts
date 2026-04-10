import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    DiscoveryModule,
    WorkspaceIteratorModule,
    TypeOrmModule.forFeature([UpgradeMigrationEntity, WorkspaceEntity]),
  ],
  providers: [
    UpgradeMigrationService,
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    UpgradeCommandRegistryService,
    UpgradeSequenceReaderService,
    UpgradeSequenceRunnerService,
  ],
  exports: [
    UpgradeMigrationService,
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    UpgradeCommandRegistryService,
    UpgradeSequenceReaderService,
    UpgradeSequenceRunnerService,
  ],
})
export class UpgradeModule {}
