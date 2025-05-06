import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BackfillWorkflowNextStepIdsCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-backfill-workflow-next-step-ids.command';
import { MigrateWorkflowEventListenersToAutomatedTriggersCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-migrate-workflow-event-listeners-to-automated-triggers.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceDataSourceModule,
  ],
  providers: [
    MigrateWorkflowEventListenersToAutomatedTriggersCommand,
    BackfillWorkflowNextStepIdsCommand,
  ],
  exports: [
    MigrateWorkflowEventListenersToAutomatedTriggersCommand,
    BackfillWorkflowNextStepIdsCommand,
  ],
})
export class V0_53_UpgradeVersionCommandModule {}
