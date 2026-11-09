import { Module } from '@nestjs/common';
import { CoreEntityCacheModule } from 'src/engine/core-entity-cache/core-entity-cache.module';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { AgentChatStreamStateModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-stream-state.module';
import { AgentChatThreadModule } from 'src/engine/metadata-modules/ai/ai-chat/agent-chat-thread.module';
import { AgentChatReplyContinuationPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-continuation-policy.service';
import { AgentChatReplyExecutionPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-execution-policy.service';
import { AgentChatReplyPolicyService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-reply-policy.service';
import { AiEvaluationModule } from 'src/engine/metadata-modules/ai/ai-evaluation/ai-evaluation.module';
import { AgentHistoryModule } from 'src/engine/metadata-modules/ai/ai-history/ai-history.module';

@Module({
  imports: [
    CoreEntityCacheModule,
    AgentChatStreamStateModule,
    AgentChatThreadModule,
    AgentHistoryModule,
    AiEvaluationModule,
    FeatureFlagModule,
    UserWorkspaceModule,
  ],
  providers: [
    AgentChatReplyContinuationPolicyService,
    AgentChatReplyExecutionPolicyService,
    AgentChatReplyPolicyService,
  ],
  exports: [
    AgentChatReplyContinuationPolicyService,
    AgentChatReplyExecutionPolicyService,
    AgentChatReplyPolicyService,
  ],
})
export class AgentChatReplyPolicyModule {}
