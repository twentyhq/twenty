import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkflowNextStepIdsCommand } from 'src/database/commands/upgrade-version-command/0-52/0-52-backfill-workflow-next-step-ids.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace], 'core')],
  providers: [BackfillWorkflowNextStepIdsCommand],
  exports: [BackfillWorkflowNextStepIdsCommand],
})
export class V0_52_UpgradeVersionCommandModule {}
