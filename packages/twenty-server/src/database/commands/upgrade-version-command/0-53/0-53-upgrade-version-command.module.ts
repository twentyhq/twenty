import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkflowNextStepIdsCommand } from 'src/database/commands/upgrade-version-command/0-52/0-52-backfill-workflow-next-step-ids.command';
import { MigrateWorkflowEventListenersToAutomatedTriggersCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-migrate-workflow-event-listeners-to-automated-triggers.command';
import { RemoveRelationForeignKeyFieldMetadataCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-remove-relation-foreign-key-field-metadata.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
    WorkspaceDataSourceModule,
  ],
  providers: [
    MigrateWorkflowEventListenersToAutomatedTriggersCommand,
    BackfillWorkflowNextStepIdsCommand,
    RemoveRelationForeignKeyFieldMetadataCommand,
  ],
  exports: [
    MigrateWorkflowEventListenersToAutomatedTriggersCommand,
    RemoveRelationForeignKeyFieldMetadataCommand,
    BackfillWorkflowNextStepIdsCommand,
  ],
})
export class V0_53_UpgradeVersionCommandModule {}
