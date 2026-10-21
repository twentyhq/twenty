import { Module } from '@nestjs/common';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AgentChatCancelSubscriberService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-cancel-subscriber.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatWaitingRunService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-waiting-run.service';
import { AgentTurnStreamService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';

@Module({
  imports: [
    AgentChatThreadModule,
    AgentHistoryModule,
    MetricsModule,
    PendingWakeUpModule,
  ],
  providers: [
    AgentChatCancelSubscriberService,
    AgentChatEventPublisherService,
    AgentChatStreamHeartbeatService,
    AgentChatStreamRecoveryService,
    AgentChatWaitingRunService,
    AgentTurnStreamService,
  ],
  exports: [
    AgentChatEventPublisherService,
    AgentChatStreamHeartbeatService,
    AgentChatStreamRecoveryService,
    AgentChatWaitingRunService,
    AgentTurnStreamService,
  ],
})
export class AgentChatStreamStateModule {}
