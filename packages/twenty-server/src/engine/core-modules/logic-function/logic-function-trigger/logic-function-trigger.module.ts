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
import { ServerCronTriggerJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/jobs/server-cron-trigger.job';
import { ServerCronTriggerCronCommand } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/server-cron-trigger.cron.command';
import { ServerCronTriggerCronJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/server-cron-trigger.cron.job';
import { ServerCronDispatchRateLimiterService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/services/server-cron-dispatch-rate-limiter.service';
import { ServerCronDispatchTargetResolverService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/server-cron/services/server-cron-dispatch-target-resolver.service';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/database-event/call-database-event-trigger-jobs.job';
import { LogicFunctionTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/logic-function-trigger.service';
import { RouteTriggerService } from 'src/engine/core-modules/logic-function/logic-function-trigger/triggers/route/route-trigger.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
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
    MetricsModule,
    ThrottlerModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(LogicFunctionEntity),
    LogicFunctionTriggerJob,
    ApplicationLifecycleHookJob,
    LogicFunctionJobRunnerService,
    CronTriggerCronJob,
    CronTriggerCronCommand,
    ServerCronTriggerCronJob,
    ServerCronTriggerCronCommand,
    ServerCronTriggerJob,
    ServerCronDispatchTargetResolverService,
    ServerCronDispatchRateLimiterService,
    CallDatabaseEventTriggerJobsJob,
    LogicFunctionTriggerService,
    RouteTriggerService,
  ],
  exports: [
    CronTriggerCronCommand,
    ServerCronTriggerCronCommand,
    LogicFunctionTriggerService,
    RouteTriggerService,
  ],
})
export class LogicFunctionTriggerModule {}
