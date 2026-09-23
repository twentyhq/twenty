import { isDefined } from 'twenty-shared/utils';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { ForbiddenError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const USER_SESSION_TOKEN_TYPES: JwtTokenTypeEnum[] = [
  JwtTokenTypeEnum.ACCESS,
  JwtTokenTypeEnum.PLAYGROUND,
  JwtTokenTypeEnum.WORKSPACE_AGNOSTIC,
];

export const isUserSessionPrincipal = (principal: {
  user?: unknown;
  tokenType?: JwtTokenTypeEnum;
}): boolean =>
  isDefined(principal.user) &&
  isDefined(principal.tokenType) &&
  USER_SESSION_TOKEN_TYPES.includes(principal.tokenType);

export const buildUserSessionRequiredError = () =>
  new ForbiddenError(
    new AuthException(
      'This endpoint requires a user session',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    ),
  );
