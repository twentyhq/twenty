import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { CronModule } from 'src/engine/core-modules/cron/cron.module';
import { WorkspaceDomainsModule } from 'src/engine/core-modules/domain/workspace-domains/workspace-domains.module';
import { ApplicationLifecycleHookJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/application-lifecycle-hook.job';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/jobs/logic-function-trigger.job';
import { LogicFunctionJobRunnerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-job-runner.service';
import { CronTriggerCronCommand } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/cron/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/cron/cron-trigger.cron.job';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/call-database-event-trigger-jobs.job';
import { DeferredDatabaseEventTriggerListener } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/listeners/deferred-database-event-trigger.listener';
import { DeferredDatabaseEventTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/services/deferred-database-event-trigger.service';
import { LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSignalModule } from 'src/engine/core-modules/workspace-signal/workspace-signal.module';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LogicFunctionEntity, WorkspaceEntity]),
    TokenModule,
    WorkspaceDomainsModule,
    WorkspaceCacheModule,
    CronModule,
    RecordShareModule,
    WorkspaceSignalModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(LogicFunctionEntity),
    LogicFunctionTriggerJob,
    ApplicationLifecycleHookJob,
    LogicFunctionJobRunnerService,
    CronTriggerCronJob,
    CronTriggerCronCommand,
    CallDatabaseEventTriggerJobsJob,
    DeferredDatabaseEventTriggerService,
    DeferredDatabaseEventTriggerListener,
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
