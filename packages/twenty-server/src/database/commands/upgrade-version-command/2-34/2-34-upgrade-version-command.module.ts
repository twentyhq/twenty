import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { RepairActivityTargetsJunctionTargetCommand } from 'src/database/commands/upgrade-version-command/2-34/2-34-workspace-command-1787461587487-repair-activity-targets-junction-target.command';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    WorkspaceIteratorModule,
    WorkspaceMigrationRunnerModule,
  ],
  providers: [RepairActivityTargetsJunctionTargetCommand],
})
export class V2_34_UpgradeVersionCommandModule {}
