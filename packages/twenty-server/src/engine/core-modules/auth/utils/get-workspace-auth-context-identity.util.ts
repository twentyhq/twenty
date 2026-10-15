import { assertUnreachable } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const getWorkspaceAuthContextIdentity = (
  authContext: WorkspaceAuthContext,
): string => {
  const workspaceId = authContext.workspace.id;

  switch (authContext.type) {
    case 'system':
      return `system:${workspaceId}`;
    case 'apiKey':
      return `apiKey:${workspaceId}:${authContext.apiKey.id}`;
    case 'application':
      return [
        'application',
        workspaceId,
        authContext.application.id,
        authContext.agentId ?? '',
        authContext.actingAgent?.id ?? '',
      ].join(':');
    case 'user':
      return [
        'user',
        workspaceId,
        authContext.userWorkspaceId,
        authContext.application?.id ?? '',
        authContext.viaApplication?.id ?? '',
        authContext.agentId ?? '',
      ].join(':');
    case 'pendingActivationUser':
      return `pendingActivationUser:${workspaceId}:${authContext.userWorkspaceId}`;
    default:
      return assertUnreachable(authContext);
  }
};
