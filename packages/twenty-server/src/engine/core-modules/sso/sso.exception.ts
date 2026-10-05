/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum SsoExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  IDENTITY_PROVIDER_NOT_FOUND = 'IDENTITY_PROVIDER_NOT_FOUND',
  IDENTITY_PROVIDER_ALREADY_EXISTS = 'IDENTITY_PROVIDER_ALREADY_EXISTS',
  INVALID_ISSUER_URL = 'INVALID_ISSUER_URL',
  INVALID_IDP_TYPE = 'INVALID_IDP_TYPE',
  UNKNOWN_SSO_CONFIGURATION_ERROR = 'UNKNOWN_SSO_CONFIGURATION_ERROR',
  SSO_DISABLE = 'SSO_DISABLE',
}

const getSsoExceptionUserFriendlyMessage = (code: SsoExceptionCode) => {
  switch (code) {
    case SsoExceptionCode.USER_NOT_FOUND:
      return msg`User not found.`;
    case SsoExceptionCode.IDENTITY_PROVIDER_NOT_FOUND:
      return msg`Identity provider not found.`;
    case SsoExceptionCode.IDENTITY_PROVIDER_ALREADY_EXISTS:
      return msg`Identity provider already exists.`;
    case SsoExceptionCode.INVALID_ISSUER_URL:
      return msg`Invalid issuer URL.`;
    case SsoExceptionCode.INVALID_IDP_TYPE:
      return msg`Invalid identity provider type.`;
    case SsoExceptionCode.UNKNOWN_SSO_CONFIGURATION_ERROR:
      return msg`SSO configuration error.`;
    case SsoExceptionCode.SSO_DISABLE:
      return msg`SSO is disabled.`;
    default:
      assertUnreachable(code);
  }
};
const SSO_EXCEPTION_CATEGORY_BY_CODE = {
  [SsoExceptionCode.USER_NOT_FOUND]: 'NOT_FOUND',
  [SsoExceptionCode.IDENTITY_PROVIDER_NOT_FOUND]: 'NOT_FOUND',
  [SsoExceptionCode.IDENTITY_PROVIDER_ALREADY_EXISTS]: 'CONFLICT',
  [SsoExceptionCode.INVALID_ISSUER_URL]: 'BAD_USER_INPUT',
  [SsoExceptionCode.INVALID_IDP_TYPE]: 'BAD_USER_INPUT',
  [SsoExceptionCode.UNKNOWN_SSO_CONFIGURATION_ERROR]: 'INTERNAL_SERVER_ERROR',
  [SsoExceptionCode.SSO_DISABLE]: 'FORBIDDEN',
} as const satisfies Record<SsoExceptionCode, ExceptionCategory>;

export class SsoException extends CustomException<SsoExceptionCode> {
  constructor(
    message: string,
    code: SsoExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getSsoExceptionUserFriendlyMessage(code),
      category: SSO_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
