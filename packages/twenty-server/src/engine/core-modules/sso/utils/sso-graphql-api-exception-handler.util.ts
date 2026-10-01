/* @license Enterprise */

import { assertUnreachable } from 'twenty-shared/utils';

import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type SsoException,
  SsoExceptionCode,
} from 'src/engine/core-modules/sso/sso.exception';

export const ssoGraphqlApiExceptionHandler = (exception: SsoException) => {
  switch (exception.code) {
    case SsoExceptionCode.USER_NOT_FOUND:
    case SsoExceptionCode.IDENTITY_PROVIDER_NOT_FOUND:
      throw new NotFoundError(exception);
    case SsoExceptionCode.IDENTITY_PROVIDER_ALREADY_EXISTS:
      throw new ConflictError(exception);
    case SsoExceptionCode.INVALID_ISSUER_URL:
    case SsoExceptionCode.INVALID_IDP_TYPE:
      throw new UserInputError(exception);
    case SsoExceptionCode.SSO_DISABLE:
      throw new ForbiddenError(exception);
    case SsoExceptionCode.UNKNOWN_SSO_CONFIGURATION_ERROR:
      throw exception;
    default: {
      assertUnreachable(exception.code);
    }
  }
};
