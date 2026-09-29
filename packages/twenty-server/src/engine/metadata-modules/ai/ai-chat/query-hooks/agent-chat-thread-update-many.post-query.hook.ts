import { Injectable } from '@nestjs/common';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

@Injectable()
@WorkspaceQueryHook({
  key: `agentChatThread.updateMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class AgentChatThreadUpdateManyPostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: Pick<AgentChatThreadWorkspaceEntity, 'id'>[],
  ): Promise<void> {
    await this.threadLifecycleService.stopArchivedThreads({
      workspaceId: authContext.workspace.id,
      threadIds: payload.map((thread) => thread.id),
    });
  }
}
