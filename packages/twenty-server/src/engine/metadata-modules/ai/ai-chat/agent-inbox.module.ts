import { Global, Module } from '@nestjs/common';

import { AiChatModule } from 'src/engine/metadata-modules/ai/ai-chat/ai-chat.module';
import { AGENT_INBOX_SERVICE_TOKEN } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-inbox-service.token';
import { AgentInboxService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox.service';

// Global module to make AGENT_INBOX_SERVICE_TOKEN available to workflow
// actions, which cannot import AiChatModule directly
@Global()
@Module({
  imports: [AiChatModule],
  providers: [
    { provide: AGENT_INBOX_SERVICE_TOKEN, useExisting: AgentInboxService },
  ],
  exports: [AGENT_INBOX_SERVICE_TOKEN],
})
export class AgentInboxModule {}
