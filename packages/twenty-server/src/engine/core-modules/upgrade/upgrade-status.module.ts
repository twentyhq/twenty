import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';
import { UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    CoreEntityCacheModule,
    DiscoveryModule,
    TypeOrmModule.forFeature([UpgradeMigrationEntity, WorkspaceEntity]),
  ],
  providers: [
    UpgradeCommandRegistryService,
    UpgradeMigrationService,
    UpgradeSequenceReaderService,
    UpgradeStatusCacheService,
    UpgradeStatusService,
  ],
  exports: [
    UpgradeCommandRegistryService,
    UpgradeMigrationService,
    UpgradeSequenceReaderService,
    UpgradeStatusCacheService,
    UpgradeStatusService,
  ],
})
export class UpgradeStatusModule {}
