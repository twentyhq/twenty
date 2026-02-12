/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SSOExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  IDENTITY_PROVIDER_NOT_FOUND = 'IDENTITY_PROVIDER_NOT_FOUND',
  INVALID_ISSUER_URL = 'INVALID_ISSUER_URL',
  INVALID_IDP_TYPE = 'INVALID_IDP_TYPE',
  UNKNOWN_SSO_CONFIGURATION_ERROR = 'UNKNOWN_SSO_CONFIGURATION_ERROR',
  SSO_DISABLE = 'SSO_DISABLE',
}

const getSSOExceptionUserFriendlyMessage = (code: SSOExceptionCode) => {
  switch (code) {
    case SSOExceptionCode.USER_NOT_FOUND:
      return msg`User not found.`;
    case SSOExceptionCode.IDENTITY_PROVIDER_NOT_FOUND:
      return msg`Identity provider not found.`;
    case SSOExceptionCode.INVALID_ISSUER_URL:
      return msg`Invalid issuer URL.`;
    case SSOExceptionCode.INVALID_IDP_TYPE:
      return msg`Invalid identity provider type.`;
    case SSOExceptionCode.UNKNOWN_SSO_CONFIGURATION_ERROR:
      return msg`SSO configuration error.`;
    case SSOExceptionCode.SSO_DISABLE:
      return msg`SSO is disabled.`;
    default:
      assertUnreachable(code);
  }
};

export class SSOException extends CustomException<SSOExceptionCode> {
  constructor(
    message: string,
    code: SSOExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getSSOExceptionUserFriendlyMessage(code),
    });
  }
}
