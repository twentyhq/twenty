import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const getUserWorkspaceIdFromAuthContext = (
  authContext: WorkspaceAuthContext | undefined,
): string | undefined =>
  isDefined(authContext) && isUserAuthContext(authContext)
    ? authContext.userWorkspaceId
    : undefined;
