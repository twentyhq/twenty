import { Module } from '@nestjs/common';

import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatThreadCreateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-one.post-query.hook';
import { AgentChatThreadCreateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-many.post-query.hook';
import { AgentChatThreadUpdateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-update-one.post-query.hook';
import { AgentChatThreadUpdateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-update-many.post-query.hook';
import { AgentChatThreadDestroyOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-destroy-one.post-query.hook';
import { AgentChatThreadDestroyManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-destroy-many.post-query.hook';

@Module({
  imports: [AgentChatThreadLifecycleModule],
  providers: [
    AgentChatThreadCreateOnePostQueryHook,
    AgentChatThreadCreateManyPostQueryHook,
    AgentChatThreadUpdateOnePostQueryHook,
    AgentChatThreadUpdateManyPostQueryHook,
    AgentChatThreadDestroyOnePostQueryHook,
    AgentChatThreadDestroyManyPostQueryHook,
  ],
})
export class AgentChatThreadQueryHookModule {}
