import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { UpgradeMigrationModule } from 'src/engine/core-modules/upgrade-migration/upgrade-migration.module';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    DiscoveryModule,
    WorkspaceIteratorModule,
    UpgradeMigrationModule,
    TypeOrmModule.forFeature([WorkspaceEntity]),
  ],
  providers: [
    InstanceCommandRunnerService,
    WorkspaceCommandRunnerService,
    UpgradeCommandRegistryService,
    UpgradeSequenceReaderService,
    UpgradeSequenceRunnerService,
  ],
  exports: [
    UpgradeMigrationModule,
    InstanceCommandRunnerService,
    WorkspaceCommandRunnerService,
    UpgradeCommandRegistryService,
    UpgradeSequenceReaderService,
    UpgradeSequenceRunnerService,
  ],
})
export class UpgradeModule {}
