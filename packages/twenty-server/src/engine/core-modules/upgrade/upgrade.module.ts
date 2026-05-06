import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { InstanceCommandProviderModule } from 'src/database/commands/upgrade-version-command/instance-command-provider.module';
import { WorkspaceCommandProviderModule } from 'src/database/commands/upgrade-version-command/workspace-command-provider.module';
import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { InstanceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/instance-command-runner.service';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeSequenceRunnerService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-runner.service';
import { UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { WorkspaceCommandRunnerService } from 'src/engine/core-modules/upgrade/services/workspace-command-runner.service';
import { UpgradeGaugeService } from 'src/engine/core-modules/upgrade/upgrade-gauge.service';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceVersionModule } from 'src/engine/workspace-manager/workspace-version/workspace-version.module';

@Module({
  imports: [
    CoreEntityCacheModule,
    DiscoveryModule,
    InstanceCommandProviderModule,
    MetricsModule,
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
    UpgradeStatusService,
    UpgradeStatusCacheService,
    UpgradeGaugeService,
  ],
  exports: [
    UpgradeMigrationService,
    InstanceCommandRunnerService,
    WorkspaceCommandRunnerService,
    UpgradeCommandRegistryService,
    UpgradeSequenceReaderService,
    UpgradeSequenceRunnerService,
    UpgradeStatusService,
    UpgradeStatusCacheService,
  ],
})
export class UpgradeModule {}
