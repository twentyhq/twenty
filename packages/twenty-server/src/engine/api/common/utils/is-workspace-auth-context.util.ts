import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export const isWorkspaceAuthContext = (
  context: AuthContext,
): context is WorkspaceAuthContext => {
  return (
    isDefined(context.workspace) &&
    (isDefined(context.userWorkspaceId) ||
      isDefined(context.apiKey) ||
      isDefined(context.application))
  );
};
