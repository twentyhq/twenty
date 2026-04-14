import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { InstanceCommandProviderModule } from 'src/database/commands/upgrade-version-command/instance-command-provider.module';
import { WorkspaceCommandProviderModule } from 'src/database/commands/upgrade-version-command/workspace-command-provider.module';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceVersionModule } from 'src/engine/workspace-manager/workspace-version/workspace-version.module';

@Module({
  imports: [
    DiscoveryModule,
    InstanceCommandProviderModule,
    WorkspaceCommandProviderModule,
    WorkspaceIteratorModule,
    WorkspaceVersionModule,
    TypeOrmModule.forFeature([UpgradeMigrationEntity, WorkspaceEntity]),
  ],
  providers: [
    UpgradeMigrationService,
    InstanceCommandRunnerService,
    WorkspaceCommandRunnerService,
    UpgradeCommandRegistryService,
    UpgradeSequenceReaderService,
    UpgradeSequenceRunnerService,
  ],
  exports: [
    UpgradeMigrationService,
    InstanceCommandRunnerService,
    WorkspaceCommandRunnerService,
    UpgradeCommandRegistryService,
    UpgradeSequenceReaderService,
    UpgradeSequenceRunnerService,
  ],
})
export class UpgradeModule {}
