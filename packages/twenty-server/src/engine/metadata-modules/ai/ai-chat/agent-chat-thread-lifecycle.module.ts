import { Module } from '@nestjs/common';

import { RecordShareStorageModule } from 'src/engine/core-modules/record-share/record-share-storage.module';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

// Kept apart from AiChatModule so the record API's query hooks can reach these
// side effects without pulling in the chat's tool and workflow dependencies.
@Module({
  imports: [AgentHistoryModule, RecordShareStorageModule, WorkspaceCacheModule],
  providers: [
    AgentChatThreadLifecycleService,
    AgentChatThreadRecordEventService,
  ],
  exports: [AgentChatThreadLifecycleService, AgentChatThreadRecordEventService],
})
export class AgentChatThreadLifecycleModule {}
