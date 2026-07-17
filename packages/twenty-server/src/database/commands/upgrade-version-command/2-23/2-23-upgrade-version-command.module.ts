import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceIteratorModule } from 'src/database/commands/command-runners/workspace-iterator.module';
import { AddWorkflowCoreSoftRefFieldCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784286706000-add-workflow-core-soft-ref-field.command';
import { BackfillWorkflowCoreLinksCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784286707000-backfill-workflow-core-links.command';
import { ReconcileSystemRelationFieldUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-23/2-23-workspace-command-1784276808000-reconcile-system-relation-field-universal-identifier.command';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/workspace-migration-runner.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FieldMetadataEntity]),
    ApplicationModule,
    WorkspaceCacheModule,
    WorkspaceMigrationModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceIteratorModule,
  ],
  providers: [
    AddWorkflowCoreSoftRefFieldCommand,
    BackfillWorkflowCoreLinksCommand,
    ReconcileSystemRelationFieldUniversalIdentifierCommand,
  ],
})
export class V2_23_UpgradeVersionCommandModule {}
