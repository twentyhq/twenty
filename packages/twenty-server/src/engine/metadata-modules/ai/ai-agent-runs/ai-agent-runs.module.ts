import { Module } from '@nestjs/common';

import { AgentRunsResolver } from 'src/engine/metadata-modules/ai/ai-agent-runs/resolvers/agent-runs.resolver';
import { AgentRunsService } from 'src/engine/metadata-modules/ai/ai-agent-runs/services/agent-runs.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [AgentHistoryModule, PermissionsModule],
  providers: [AgentRunsResolver, AgentRunsService],
})
export class AiAgentRunsModule {}
