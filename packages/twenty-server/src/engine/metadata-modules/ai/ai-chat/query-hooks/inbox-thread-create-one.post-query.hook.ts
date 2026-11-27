import { Injectable } from '@nestjs/common';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { InboxObjectNamesResolverService } from 'src/engine/metadata-modules/ai/ai-history/services/inbox-object-names-resolver.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';

@Injectable()
@WorkspaceQueryHook({
  key: `inboxThread.createOne`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class InboxThreadCreateOnePostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    private readonly threadService: AgentChatThreadService,
    private readonly inboxObjectNamesResolverService: InboxObjectNamesResolverService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    objectName: string,
    payload: Pick<AgentChatThreadWorkspaceEntity, 'id'>[],
  ): Promise<void> {
    if (
      !(await this.inboxObjectNamesResolverService.isInboxThreadObjectName({
        workspaceId: authContext.workspace.id,
        objectNameSingular: objectName,
      }))
    ) {
      return;
    }

    await this.threadService.assignCreatedThreadsToCreator({
      authContext,
      threadIds: payload.map((thread) => thread.id),
    });
  }
}
