import { Module } from '@nestjs/common';

import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatThreadCreateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-many.post-query.hook';
import { AgentChatThreadCreateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-one.post-query.hook';
import { AgentChatThreadDeleteManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-delete-many.post-query.hook';
import { AgentChatThreadDeleteManyPreQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-delete-many.pre-query.hook';
import { AgentChatThreadDeleteOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-delete-one.post-query.hook';
import { AgentChatThreadDeleteOnePreQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-delete-one.pre-query.hook';
import { AgentChatThreadDestroyManyPreQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-destroy-many.pre-query.hook';
import { AgentChatThreadDestroyOnePreQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-destroy-one.pre-query.hook';
import { AgentChatThreadUpdateManyPreQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-update-many.pre-query.hook';
import { AgentChatThreadUpdateOnePreQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-update-one.pre-query.hook';

@Module({
  imports: [AgentChatThreadLifecycleModule],
  providers: [
    AgentChatThreadCreateOnePostQueryHook,
    AgentChatThreadCreateManyPostQueryHook,
    AgentChatThreadUpdateOnePreQueryHook,
    AgentChatThreadUpdateManyPreQueryHook,
    AgentChatThreadDeleteOnePreQueryHook,
    AgentChatThreadDeleteManyPreQueryHook,
    AgentChatThreadDeleteOnePostQueryHook,
    AgentChatThreadDeleteManyPostQueryHook,
    AgentChatThreadDestroyOnePreQueryHook,
    AgentChatThreadDestroyManyPreQueryHook,
  ],
})
export class AgentChatThreadQueryHookModule {}
