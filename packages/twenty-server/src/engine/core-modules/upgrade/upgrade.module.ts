import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InstanceUpgradeEntity } from 'src/engine/core-modules/upgrade/instance-upgrade.entity';
import { CoreMigrationGeneratorService } from 'src/engine/core-modules/upgrade/services/core-migration-generator.service';
import { InstanceUpgradeService } from 'src/engine/core-modules/upgrade/services/instance-upgrade.service';
import { RegisteredCoreMigrationService } from 'src/engine/core-modules/upgrade/services/registered-core-migration-registry.service';
import { WorkspaceUpgradeService } from 'src/engine/core-modules/upgrade/services/workspace-upgrade.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InstanceUpgradeEntity, WorkspaceEntity]),
  ],
  providers: [
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    CoreMigrationGeneratorService,
    RegisteredCoreMigrationService,
  ],
  exports: [
    InstanceUpgradeService,
    WorkspaceUpgradeService,
    CoreMigrationGeneratorService,
    RegisteredCoreMigrationService,
  ],
})
export class UpgradeModule {}
