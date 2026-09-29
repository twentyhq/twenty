import { Module } from '@nestjs/common';

import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatThreadCreateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-one.post-query.hook';
import { AgentChatThreadCreateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-many.post-query.hook';

@Module({
  imports: [AgentChatThreadLifecycleModule],
  providers: [
    AgentChatThreadCreateOnePostQueryHook,
    AgentChatThreadCreateManyPostQueryHook,
  ],
})
export class AgentChatThreadQueryHookModule {}
