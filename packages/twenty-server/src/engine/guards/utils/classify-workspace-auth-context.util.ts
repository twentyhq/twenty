import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';

const classifyApplicationPrincipal = ({
  application,
  variant,
  withAgent,
}: {
  application: Pick<FlatApplication, 'sourceType'>;
  variant: 'withUser' | 'withoutUser';
  withAgent: boolean;
}): AuthPrincipalVariant | undefined => {
  if (!isOAuthOnlyApplication(application)) {
    return { kind: 'application', variant, withAgent };
  }

  return withAgent ? undefined : { kind: 'oauthClient', variant };
};

// The counterpart of classifyAuthPrincipal for callers that hold an auth context
// instead of a request
export const classifyWorkspaceAuthContext = (
  authContext: WorkspaceAuthContext,
): AuthPrincipalVariant | undefined => {
  switch (authContext.type) {
    case 'user': {
      if (isDefined(authContext.application)) {
        return classifyApplicationPrincipal({
          application: authContext.application,
          variant: 'withUser',
          withAgent: isDefined(authContext.agentId),
        });
      }

      return isDefined(authContext.agentId)
        ? undefined
        : { kind: 'userSession', variant: authContext.userSessionVariant };
    }
    case 'pendingActivationUser':
      return { kind: 'userSession', variant: 'standard' };
    case 'apiKey':
      return { kind: 'apiKey' };
    case 'application':
      return classifyApplicationPrincipal({
        application: authContext.application,
        variant: 'withoutUser',
        withAgent:
          isDefined(authContext.agentId) || isDefined(authContext.actingAgent),
      });
    case 'system':
      return undefined;
    default:
      return assertUnreachable(authContext);
  }
};
