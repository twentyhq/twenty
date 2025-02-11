import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddContextToActorCompositeTypeCommand } from 'src/database/commands/upgrade-version/0-41/0-41-add-context-to-actor-composite-type';
import { RemoveDuplicateMcmasCommand } from 'src/database/commands/upgrade-version/0-41/0-41-remove-duplicate-mcmas';
import { SeedWorkflowViewsCommand } from 'src/database/commands/upgrade-version/0-41/0-41-seed-workflow-views.command';
import { UpgradeTo0_41Command } from 'src/database/commands/upgrade-version/0-41/0-41-upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { WorkspaceHealthModule } from 'src/engine/workspace-manager/workspace-health/workspace-health.module';
import { SyncWorkspaceLoggerService } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/services/sync-workspace-logger.service';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';
import { WorkspaceSyncMetadataCommandsModule } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/workspace-sync-metadata-commands.module';
import { WorkspaceSyncMetadataModule } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
    TypeORMModule,
    DataSourceModule,
    ObjectMetadataModule,
    WorkspaceSyncMetadataCommandsModule,
    WorkspaceSyncMetadataModule,
    WorkspaceHealthModule,
    WorkspaceDataSourceModule,
    WorkspaceMetadataVersionModule,
  ],
  providers: [
    SyncWorkspaceLoggerService,
    SyncWorkspaceMetadataCommand,
    SeedWorkflowViewsCommand,
    UpgradeTo0_41Command,
    AddContextToActorCompositeTypeCommand,
    RemoveDuplicateMcmasCommand,
  ],
})
export class UpgradeTo0_41CommandModule {}
