import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UpdateCreatedByEnumCommand } from 'src/database/commands/upgrade-version-command/1-14/1-14-update-created-by-enum.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    DataSourceModule,
    WorkspaceSchemaManagerModule,
  ],
  providers: [UpdateCreatedByEnumCommand],
  exports: [UpdateCreatedByEnumCommand],
})
export class V1_14_UpgradeVersionCommandModule {}
