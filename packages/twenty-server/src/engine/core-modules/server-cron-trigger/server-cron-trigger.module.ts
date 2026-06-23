import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LogicFunctionExecutorModule } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.module';
import { ServerCronTriggerDispatchJob } from 'src/engine/core-modules/server-cron-trigger/jobs/server-cron-trigger-dispatch.job';
import { ServerCronTriggerCronCommand } from 'src/engine/core-modules/server-cron-trigger/server-cron-trigger.cron.command';
import { ServerCronTriggerCronJob } from 'src/engine/core-modules/server-cron-trigger/server-cron-trigger.cron.job';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceEntity]),
    LogicFunctionExecutorModule,
    WorkspaceCacheModule,
  ],
  providers: [
    ServerCronTriggerCronJob,
    ServerCronTriggerDispatchJob,
    ServerCronTriggerCronCommand,
  ],
  exports: [ServerCronTriggerCronCommand],
})
export class ServerCronTriggerModule {}
