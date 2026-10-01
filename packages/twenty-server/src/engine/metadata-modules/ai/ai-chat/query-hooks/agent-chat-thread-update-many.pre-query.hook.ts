import { type WorkspacePreQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';
import { type UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { excludeWorkflowRunThreadsFromFilter } from 'src/engine/metadata-modules/ai/ai-chat/utils/exclude-workflow-run-threads-from-filter.util';

@WorkspaceQueryHook(`agentChatThread.updateMany`)
export class AgentChatThreadUpdateManyPreQueryHook implements WorkspacePreQueryHookInstance {
  async execute(
    _authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: UpdateManyResolverArgs,
  ): Promise<UpdateManyResolverArgs> {
    return {
      ...payload,
      filter: excludeWorkflowRunThreadsFromFilter(payload.filter),
    };
  }
}
