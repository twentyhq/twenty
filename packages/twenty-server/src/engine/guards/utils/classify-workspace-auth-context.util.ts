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

// The in-process counterpart of classifyAuthPrincipal, for callers that hold an
// auth context instead of a request: a session's token type is not kept, so
// every user is a standard session
export const classifyWorkspaceAuthContext = (
  authContext: WorkspaceAuthContext,
): AuthPrincipalVariant | undefined => {
  switch (authContext.type) {
    case 'user': {
      const application = authContext.application ?? authContext.viaApplication;

      if (isDefined(application)) {
        return classifyApplicationPrincipal({
          application,
          variant: 'withUser',
          withAgent: isDefined(authContext.agentId),
        });
      }

      return isDefined(authContext.agentId)
        ? undefined
        : { kind: 'userSession', variant: 'standard' };
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
