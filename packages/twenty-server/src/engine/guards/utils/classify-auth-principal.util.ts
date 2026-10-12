import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type AuthPrincipalVariant } from 'src/engine/guards/types/auth-principal-variant.type';

type AuthPrincipalRequest = {
  user?: unknown;
  apiKey?: unknown;
  application?: Pick<FlatApplication, 'sourceType'> | null;
  tokenType?: JwtTokenTypeEnum;
  impersonationContext?: RawAuthContext['impersonationContext'];
};

const isImpersonating = (
  impersonationContext: AuthPrincipalRequest['impersonationContext'],
): boolean =>
  isNonEmptyString(impersonationContext?.impersonatorUserWorkspaceId) &&
  isNonEmptyString(impersonationContext?.impersonatedUserWorkspaceId);

const carriesUserWithoutOtherPrincipal = (
  request: AuthPrincipalRequest,
): boolean =>
  isDefined(request.user) &&
  !isDefined(request.apiKey) &&
  !isDefined(request.application);

export const classifyAuthPrincipal = (
  request: AuthPrincipalRequest,
): AuthPrincipalVariant | undefined => {
  switch (request.tokenType) {
    case JwtTokenTypeEnum.API_KEY:
      return isDefined(request.apiKey) &&
        !isDefined(request.user) &&
        !isDefined(request.application) &&
        !isDefined(request.impersonationContext)
        ? { kind: 'apiKey' }
        : undefined;
    case JwtTokenTypeEnum.APPLICATION_ACCESS:
      if (
        !isDefined(request.application) ||
        isDefined(request.apiKey) ||
        isDefined(request.impersonationContext)
      ) {
        return undefined;
      }

      return {
        kind: isOAuthOnlyApplication(request.application)
          ? 'oauthClient'
          : 'application',
        variant: isDefined(request.user) ? 'withUser' : 'withoutUser',
      };
    case JwtTokenTypeEnum.ACCESS:
      return carriesUserWithoutOtherPrincipal(request)
        ? {
            kind: 'userSession',
            variant: isImpersonating(request.impersonationContext)
              ? 'impersonated'
              : 'standard',
          }
        : undefined;
    case JwtTokenTypeEnum.PLAYGROUND:
      return carriesUserWithoutOtherPrincipal(request) &&
        !isDefined(request.impersonationContext)
        ? { kind: 'userSession', variant: 'playground' }
        : undefined;
    case JwtTokenTypeEnum.WORKSPACE_AGNOSTIC:
      return carriesUserWithoutOtherPrincipal(request) &&
        !isDefined(request.impersonationContext)
        ? { kind: 'userSession', variant: 'workspaceAgnostic' }
        : undefined;
    default:
      return undefined;
  }
};
