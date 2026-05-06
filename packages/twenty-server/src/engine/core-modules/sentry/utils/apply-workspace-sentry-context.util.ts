import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { applyWorkspaceSentryFields } from 'src/engine/core-modules/sentry/utils/apply-workspace-sentry-fields.util';

export const applyWorkspaceSentryContext = (
  authContext: WorkspaceAuthContext,
): void => {
  const workspaceId = authContext.workspace?.id;

  if (!workspaceId) {
    return;
  }

  switch (authContext.type) {
    case 'user':
    case 'pendingActivationUser':
      applyWorkspaceSentryFields({
        workspaceId,
        userWorkspaceId: authContext.userWorkspaceId,
      });
      return;
    case 'apiKey':
    case 'application':
    case 'system':
      applyWorkspaceSentryFields({ workspaceId });
      return;
  }
};
