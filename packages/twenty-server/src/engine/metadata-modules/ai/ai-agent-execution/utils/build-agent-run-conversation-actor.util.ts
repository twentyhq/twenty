import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';

export const buildAgentRunConversationActor = ({
  authContext,
  application,
}: {
  authContext: WorkspaceAuthContext;
  application: Pick<FlatApplication, 'id'> | undefined;
}): AgentConversationActor | undefined => {
  if (isUserAuthContext(authContext)) {
    return { type: 'user', workspaceMemberId: authContext.workspaceMemberId };
  }

  if (isDefined(application)) {
    return { type: 'application', applicationId: application.id };
  }

  return undefined;
};
