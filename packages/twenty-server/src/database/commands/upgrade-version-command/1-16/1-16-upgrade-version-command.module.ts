import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UpdateTaskOnDeleteActionCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-update-task-on-delete-action.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceCacheModule,
    FieldMetadataModule,
  ],
  providers: [UpdateTaskOnDeleteActionCommand],
  exports: [UpdateTaskOnDeleteActionCommand],
})
export class V1_16_UpgradeVersionCommandModule {}
