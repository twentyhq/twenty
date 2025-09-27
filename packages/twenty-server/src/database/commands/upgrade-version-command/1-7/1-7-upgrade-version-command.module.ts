import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegeneratePersonSearchVectorWithPhonesCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-regenerate-person-search-vector-with-phones.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace]), WorkspaceDataSourceModule],
  providers: [RegeneratePersonSearchVectorWithPhonesCommand],
  exports: [RegeneratePersonSearchVectorWithPhonesCommand],
})
export class V1_7_UpgradeVersionCommandModule {}
