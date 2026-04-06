import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstanceUpgradeEntity } from 'src/engine/core-modules/upgrade/instance-upgrade.entity';
import { InstanceCommandGenerationService } from 'src/engine/core-modules/upgrade/services/instance-command-generation.service';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { RegisteredInstanceMigrationService } from 'src/engine/core-modules/upgrade/services/registered-instance-migration-registry.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    DiscoveryModule,
    TypeOrmModule.forFeature([InstanceUpgradeEntity, WorkspaceEntity]),
  ],
  providers: [
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    // TODO prastoin does not make really sense to be exported here
    InstanceCommandGenerationService,
    RegisteredInstanceMigrationService,
  ],
  exports: [
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    // TODO prastoin does not make really sense to be exported here
    InstanceCommandGenerationService,
    RegisteredInstanceMigrationService,
  ],
})
export class UpgradeModule {}
