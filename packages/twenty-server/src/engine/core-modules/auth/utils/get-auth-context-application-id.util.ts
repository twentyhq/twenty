import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

// A user-bound application token resolves to a user context that still carries
// its application, so the id has to be read from both shapes.
export const getAuthContextApplicationId = (
  authContext: WorkspaceAuthContext,
): string | undefined => {
  if (authContext.type === 'application') {
    return authContext.application.id;
  }

  if (authContext.type === 'user') {
    return authContext.application?.id;
  }

  return undefined;
};
