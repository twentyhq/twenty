import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { CronModule } from 'src/engine/core-modules/cron/cron.module';
import { RecordShareModule } from 'src/engine/core-modules/record-share/record-share.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiAgentExecutionModule } from 'src/engine/metadata-modules/ai/ai-agent-execution/ai-agent-execution.module';
import { AgentCronTriggerCronCommand } from 'src/engine/metadata-modules/ai/ai-agent-trigger/crons/agent-cron-trigger.cron.command';
import { AgentCronTriggerCronJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/crons/agent-cron-trigger.cron.job';
import { CallAgentDatabaseEventTriggersJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/call-agent-database-event-triggers.job';
import { RunAgentTriggerJob } from 'src/engine/metadata-modules/ai/ai-agent-trigger/jobs/run-agent-trigger.job';
import { AgentTriggerRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-runner.service';
import { AgentTriggerThrottlerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-throttler.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AgentEntity, WorkspaceEntity]),
    AiAgentExecutionModule,
    ApplicationLookupModule,
    CronModule,
    RecordShareModule,
    ThrottlerModule,
    WorkspaceCacheModule,
  ],
  providers: [
    provideWorkspaceScopedRepository(AgentEntity),
    AgentCronTriggerCronCommand,
    AgentCronTriggerCronJob,
    AgentTriggerRunnerService,
    AgentTriggerThrottlerService,
    CallAgentDatabaseEventTriggersJob,
    RunAgentTriggerJob,
  ],
  exports: [AgentCronTriggerCronCommand],
})
export class AiAgentTriggerModule {}
