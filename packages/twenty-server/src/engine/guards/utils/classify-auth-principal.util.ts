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

export const classifyAuthPrincipal = (
  request: AuthPrincipalRequest,
): AuthPrincipalVariant | undefined => {
  if (isDefined(request.apiKey)) {
    return { kind: 'apiKey' };
  }

  if (isDefined(request.application)) {
    return {
      kind: isOAuthOnlyApplication(request.application)
        ? 'oauthClient'
        : 'application',
      variant: isDefined(request.user) ? 'withUser' : 'withoutUser',
    };
  }

  if (!isDefined(request.user)) {
    return undefined;
  }

  switch (request.tokenType) {
    case JwtTokenTypeEnum.ACCESS:
      return {
        kind: 'userSession',
        variant: isImpersonating(request.impersonationContext)
          ? 'impersonated'
          : 'standard',
      };
    case JwtTokenTypeEnum.PLAYGROUND:
      return { kind: 'userSession', variant: 'playground' };
    case JwtTokenTypeEnum.WORKSPACE_AGNOSTIC:
      return { kind: 'userSession', variant: 'workspaceAgnostic' };
    default:
      return undefined;
  }
};
