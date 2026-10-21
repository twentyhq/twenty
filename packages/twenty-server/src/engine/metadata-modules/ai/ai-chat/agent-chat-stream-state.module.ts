import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpModule } from 'src/engine/core-modules/pending-wake-up/pending-wake-up.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AgentChatCancelSubscriberService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-cancel-subscriber.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import { AgentChatStreamRecoveryService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatWaitingLineService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-waiting-line.service';
import { AgentTurnStreamService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-turn-stream.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    AgentChatThreadModule,
    AgentHistoryModule,
    MetricsModule,
    PendingWakeUpModule,
    TypeOrmModule.forFeature([PendingWakeUpEntity]),
  ],
  providers: [
    AgentChatCancelSubscriberService,
    AgentChatEventPublisherService,
    AgentChatStreamHeartbeatService,
    AgentChatStreamRecoveryService,
    AgentChatWaitingLineService,
    AgentTurnStreamService,
    provideWorkspaceScopedRepository(PendingWakeUpEntity),
  ],
  exports: [
    AgentChatEventPublisherService,
    AgentChatStreamHeartbeatService,
    AgentChatStreamRecoveryService,
    AgentChatWaitingLineService,
    AgentTurnStreamService,
  ],
})
export class AgentChatStreamStateModule {}
