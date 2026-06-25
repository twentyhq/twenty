import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { CronModule } from 'src/engine/core-modules/cron/cron.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { CronTriggerCronCommand } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/cron/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/cron/cron-trigger.cron.job';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/call-database-event-trigger-jobs.job';
import { LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity, WorkspaceEntity]),
    TokenModule,
    WorkspaceDomainsModule,
    WorkspaceCacheModule,
    CronModule,
  ],
  providers: [
    LogicFunctionTriggerJob,
    CronTriggerCronJob,
    CronTriggerCronCommand,
    CallDatabaseEventTriggerJobsJob,
    LogicFunctionTriggerService,
    RouteTriggerService,
  ],
  exports: [
    CronTriggerCronCommand,
    LogicFunctionTriggerService,
    RouteTriggerService,
  ],
})
export class LogicFunctionTriggerModule {}
