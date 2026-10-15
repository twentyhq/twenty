import { isDefined } from 'twenty-shared/utils';

import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type UnattestedPrincipal } from 'src/engine/core-modules/auth/types/workspace-auth-context-entry.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';

// The principal a run started by the platform acts as, matching what its token would classify as
export const getRunPrincipalFromAuthContext = (
  authContext: WorkspaceAuthContext,
): AuthPrincipalVariant | UnattestedPrincipal => {
  switch (authContext.type) {
    case 'user':
    case 'application': {
      const { application } = authContext;
      const variant = authContext.type === 'user' ? 'withUser' : 'withoutUser';

      if (!isDefined(application)) {
        return { kind: 'userSession', variant: 'standard' };
      }

      if (isOAuthOnlyApplication(application)) {
        return { kind: 'oauthClient', variant };
      }

      return {
        kind: 'application',
        variant,
        withAgent: isDefined(authContext.agentId),
      };
    }
    case 'apiKey':
      return { kind: 'apiKey' };
    case 'pendingActivationUser':
      return { kind: 'userSession', variant: 'standard' };
    case 'system':
      return { kind: 'unattested' };
  }
};
