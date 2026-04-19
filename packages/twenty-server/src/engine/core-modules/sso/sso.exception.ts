/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum SsoExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  IDENTITY_PROVIDER_NOT_FOUND = 'IDENTITY_PROVIDER_NOT_FOUND',
  INVALID_ISSUER_URL = 'INVALID_ISSUER_URL',
  INVALID_IDP_TYPE = 'INVALID_IDP_TYPE',
  UNKNOWN_Sso_CONFIGURATION_ERROR = 'UNKNOWN_Sso_CONFIGURATION_ERROR',
  Sso_DISABLE = 'Sso_DISABLE',
}

const getSsoExceptionUserFriendlyMessage = (code: SsoExceptionCode) => {
  switch (code) {
    case SsoExceptionCode.USER_NOT_FOUND:
      return msg`User not found.`;
    case SsoExceptionCode.IDENTITY_PROVIDER_NOT_FOUND:
      return msg`Identity provider not found.`;
    case SsoExceptionCode.INVALID_ISSUER_URL:
      return msg`Invalid issuer Url.`;
    case SsoExceptionCode.INVALID_IDP_TYPE:
      return msg`Invalid identity provider type.`;
    case SsoExceptionCode.UNKNOWN_Sso_CONFIGURATION_ERROR:
      return msg`Sso configuration error.`;
    case SsoExceptionCode.Sso_DISABLE:
      return msg`Sso is disabled.`;
    default:
      assertUnreachable(code);
  }
};

export class SsoException extends CustomException<SsoExceptionCode> {
  constructor(
    message: string,
    code: SsoExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getSsoExceptionUserFriendlyMessage(code),
    });
  }
}
