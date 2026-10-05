import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type DestroyOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';

@WorkspaceQueryHook(`agentChatThread.destroyOne`)
export class AgentChatThreadDestroyOnePreQueryHook implements WorkspacePreQueryHookInstance {
  constructor(
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: DestroyOneResolverArgs,
  ): Promise<DestroyOneResolverArgs> {
    await this.threadLifecycleService.assertThreadIsNotWorkflowRunThread({
      workspaceId: authContext.workspace.id,
      threadId: payload.id,
    });

    return payload;
  }
}
