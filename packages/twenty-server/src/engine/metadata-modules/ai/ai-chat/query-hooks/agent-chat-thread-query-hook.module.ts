import { Module } from '@nestjs/common';

import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AGENT_CHAT_CHANNEL_WRITE_PRE_QUERY_HOOKS } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-channel-write.pre-query.hooks';
import { AgentChatThreadCreateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-many.post-query.hook';
import { AgentChatThreadCreateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-one.post-query.hook';
import { AgentChatThreadDeleteManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-delete-many.post-query.hook';
import { AgentChatThreadDeleteOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-delete-one.post-query.hook';

@Module({
  imports: [AgentChatThreadLifecycleModule],
  providers: [
    AgentChatThreadCreateOnePostQueryHook,
    AgentChatThreadCreateManyPostQueryHook,
    AgentChatThreadDeleteOnePostQueryHook,
    AgentChatThreadDeleteManyPostQueryHook,
    ...AGENT_CHAT_CHANNEL_WRITE_PRE_QUERY_HOOKS,
  ],
})
export class AgentChatThreadQueryHookModule {}
