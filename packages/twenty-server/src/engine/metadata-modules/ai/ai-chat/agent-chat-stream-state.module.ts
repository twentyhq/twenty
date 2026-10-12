import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { Module } from '@nestjs/common';

import { AgentChatBrowsingContextService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-browsing-context.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';

@Module({
  imports: [AgentHistoryModule, MetricsModule],
  providers: [
    AgentChatStreamRecoveryService,
    AgentChatEventPublisherService,
    AgentChatStreamHeartbeatService,
    AgentChatBrowsingContextService,
  ],
  exports: [
    AgentChatStreamRecoveryService,
    AgentChatEventPublisherService,
    AgentChatStreamHeartbeatService,
    AgentChatBrowsingContextService,
  ],
})
export class AgentChatStreamStateModule {}
