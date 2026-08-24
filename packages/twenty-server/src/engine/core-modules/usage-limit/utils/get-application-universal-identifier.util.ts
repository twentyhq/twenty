import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const getApplicationUniversalIdentifier = (
  authContext: WorkspaceAuthContext,
): string | null => {
  if (isApplicationAuthContext(authContext)) {
    return authContext.application.universalIdentifier ?? null;
  }

  if (authContext.type === 'user') {
    return (
      authContext.application?.universalIdentifier ??
      authContext.viaApplication?.universalIdentifier ??
      null
    );
  }

  return null;
};
