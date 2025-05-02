import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { MigrateWorkflowEventListenersToAutomatedTriggersCommand } from 'src/database/commands/upgrade-version-command/0-53/0-53-migrate-workflow-event-listeners-to-automated-triggers.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    WorkspaceDataSourceModule,
  ],
  providers: [MigrateWorkflowEventListenersToAutomatedTriggersCommand],
  exports: [MigrateWorkflowEventListenersToAutomatedTriggersCommand],
})
export class V0_53_UpgradeVersionCommandModule {}
