import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type CallerVariant } from 'src/engine/guards/types/caller-variant.type';

type CallerRequest = {
  user?: unknown;
  apiKey?: unknown;
  application?: Pick<FlatApplication, 'sourceType'> | null;
  tokenType?: JwtTokenTypeEnum;
  impersonationContext?: RawAuthContext['impersonationContext'];
};

const isImpersonating = (
  impersonationContext: CallerRequest['impersonationContext'],
): boolean =>
  isNonEmptyString(impersonationContext?.impersonatorUserWorkspaceId) &&
  isNonEmptyString(impersonationContext?.impersonatedUserWorkspaceId);

export const classifyCaller = (
  request: CallerRequest,
): CallerVariant | undefined => {
  if (isDefined(request.apiKey)) {
    return 'apiKey';
  }

  if (isDefined(request.application)) {
    const hasUser = isDefined(request.user);

    if (isOAuthOnlyApplication(request.application)) {
      return hasUser ? 'oauthClientWithUser' : 'oauthClientWithoutUser';
    }

    return hasUser ? 'applicationWithUser' : 'applicationWithoutUser';
  }

  if (!isDefined(request.user)) {
    return undefined;
  }

  switch (request.tokenType) {
    case JwtTokenTypeEnum.ACCESS:
      return isImpersonating(request.impersonationContext)
        ? 'impersonatedSession'
        : 'session';
    case JwtTokenTypeEnum.PLAYGROUND:
      return 'playgroundSession';
    case JwtTokenTypeEnum.WORKSPACE_AGNOSTIC:
      return 'workspaceAgnosticSession';
    default:
      return undefined;
  }
};
