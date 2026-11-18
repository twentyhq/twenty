import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { isServerAdminAccessAllowedFromWorkspace } from 'src/engine/core-modules/impersonation/utils/is-server-admin-access-allowed-from-workspace.util';
import { userHasAdminPrivileges } from 'src/engine/core-modules/impersonation/utils/user-has-admin-privileges.util';
import { isImpersonating } from 'src/engine/guards/utils/is-impersonating.util';

export const hasServerAdminAccess = ({
  authContext,
  serverAdminWorkspaceId,
}: {
  authContext: Partial<
    Pick<RawAuthContext, 'user' | 'workspace' | 'impersonationContext'>
  >;
  serverAdminWorkspaceId: string | undefined;
}): boolean =>
  isDefined(authContext.user) &&
  !isImpersonating(authContext.impersonationContext) &&
  userHasAdminPrivileges(authContext.user) &&
  isServerAdminAccessAllowedFromWorkspace({
    workspaceId: authContext.workspace?.id,
    serverAdminWorkspaceId,
  });
