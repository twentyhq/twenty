import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkflowManualTriggersCommand } from 'src/database/commands/upgrade-version-command/1-16/1-16-backfill-workflow-manual-triggers.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity]), DataSourceModule],
  providers: [BackfillWorkflowManualTriggersCommand],
  exports: [BackfillWorkflowManualTriggersCommand],
})
export class V1_16_UpgradeVersionCommandModule {}
