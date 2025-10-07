import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegeneratePersonSearchVectorWithPhonesCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-regenerate-person-search-vector-with-phones.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSchemaManagerModule } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace]),
    WorkspaceSchemaManagerModule,
  ],
  providers: [RegeneratePersonSearchVectorWithPhonesCommand],
  exports: [RegeneratePersonSearchVectorWithPhonesCommand],
})
export class V1_8_UpgradeVersionCommandModule {}
