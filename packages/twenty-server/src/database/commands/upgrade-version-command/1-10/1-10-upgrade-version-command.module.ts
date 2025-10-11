import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DeduplicateUniqueFieldsCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-deduplicate-unique-fields.command';
import { MigrateWorkflowStepFilterOperandValueCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-migrate-workflow-step-filter-operand-value';
import { RegeneratePersonSearchVectorWithPhonesCommand } from 'src/database/commands/upgrade-version-command/1-10/1-10-regenerate-person-search-vector-with-phones.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace]), WorkspaceDataSourceModule],
  providers: [
    MigrateWorkflowStepFilterOperandValueCommand,
    DeduplicateUniqueFieldsCommand,
    RegeneratePersonSearchVectorWithPhonesCommand,
  ],
  exports: [
    MigrateWorkflowStepFilterOperandValueCommand,
    DeduplicateUniqueFieldsCommand,
    RegeneratePersonSearchVectorWithPhonesCommand,
  ],
})
export class V1_10_UpgradeVersionCommandModule {}
