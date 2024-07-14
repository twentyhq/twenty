import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateFileFolderStructureCommand } from 'src/database/commands/upgrade-version/0-23/0-23-update-file-folder-structure.command';


import { UpgradeTo0_23Command } from 'src/database/commands/upgrade-version/0-23/0-23-upgrade-version.command';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceCacheVersionModule } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceCacheVersionModule,
    TypeORMModule,
    DataSourceModule,
  ],
  providers: [
    UpdateFileFolderStructureCommand,
    UpgradeTo0_23Command,
  ],
})
export class UpgradeTo0_23CommandModule {}
