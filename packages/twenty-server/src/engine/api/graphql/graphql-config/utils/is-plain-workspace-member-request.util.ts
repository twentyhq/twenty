import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { classifyAuthPrincipal } from 'src/engine/guards/utils/classify-auth-principal.util';

export const isPlainWorkspaceMemberRequest = (request: Request): boolean => {
  const authPrincipalVariant = classifyAuthPrincipal(request);

  return (
    authPrincipalVariant?.kind === 'userSession' &&
    authPrincipalVariant.variant !== 'workspaceAgnostic' &&
    isDefined(request.workspace) &&
    isDefined(request.userWorkspaceId) &&
    isDefined(request.workspaceMemberId)
  );
};
