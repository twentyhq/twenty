import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AddWorkspaceForeignKeysMigrationCommand } from 'src/database/commands/upgrade-version-command/1-17/1-17-add-workspace-foreign-keys-migration.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity]), DataSourceModule],
  providers: [AddWorkspaceForeignKeysMigrationCommand],
  exports: [AddWorkspaceForeignKeysMigrationCommand],
})
export class V1_17_UpgradeVersionCommandModule {}

