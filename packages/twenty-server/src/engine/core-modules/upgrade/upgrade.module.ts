import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstanceUpgradeEntity } from 'src/engine/core-modules/upgrade/instance-upgrade.entity';
import { InstanceMigrationGenerationService } from 'src/engine/core-modules/upgrade/services/instance-migration-generation.service';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { RegisteredInstanceMigrationService } from 'src/engine/core-modules/upgrade/services/registered-instance-migration-registry.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstanceUpgradeEntity, WorkspaceEntity])],
  providers: [
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    InstanceMigrationGenerationService,
    RegisteredInstanceMigrationService,
  ],
  exports: [
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    InstanceMigrationGenerationService,
    RegisteredInstanceMigrationService,
  ],
})
export class UpgradeModule {}
