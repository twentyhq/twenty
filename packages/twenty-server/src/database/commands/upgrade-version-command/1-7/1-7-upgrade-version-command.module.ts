import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkflowManualTriggerAvailabilityCommand } from 'src/database/commands/upgrade-version-command/1-7/1-7-backfill-workflow-manual-trigger-availability.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceEntity])],
  providers: [BackfillWorkflowManualTriggerAvailabilityCommand],
  exports: [BackfillWorkflowManualTriggerAvailabilityCommand],
})
export class V1_7_UpgradeVersionCommandModule {}
