import { Module } from '@nestjs/common';

import { AgentChatThreadLifecycleModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread-lifecycle.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AgentChatThreadCreateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-many.post-query.hook';
import { AgentChatThreadCreateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-create-one.post-query.hook';
import { AgentChatThreadDeleteManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-delete-many.post-query.hook';
import { AgentChatThreadDeleteOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/agent-chat-thread-delete-one.post-query.hook';
import { InboxThreadCreateManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/inbox-thread-create-many.post-query.hook';
import { InboxThreadCreateOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/inbox-thread-create-one.post-query.hook';
import { InboxThreadDeleteManyPostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/inbox-thread-delete-many.post-query.hook';
import { InboxThreadDeleteOnePostQueryHook } from 'src/engine/metadata-modules/ai/ai-chat/query-hooks/inbox-thread-delete-one.post-query.hook';

@Module({
  imports: [AgentChatThreadLifecycleModule, AgentChatThreadModule],
  providers: [
    AgentChatThreadCreateOnePostQueryHook,
    AgentChatThreadCreateManyPostQueryHook,
    AgentChatThreadDeleteOnePostQueryHook,
    AgentChatThreadDeleteManyPostQueryHook,
    InboxThreadCreateOnePostQueryHook,
    InboxThreadCreateManyPostQueryHook,
    InboxThreadDeleteOnePostQueryHook,
    InboxThreadDeleteManyPostQueryHook,
  ],
})
export class AgentChatThreadQueryHookModule {}
