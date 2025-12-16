/* @license Enterprise */

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum SSOExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  IDENTITY_PROVIDER_NOT_FOUND = 'IDENTITY_PROVIDER_NOT_FOUND',
  INVALID_ISSUER_URL = 'INVALID_ISSUER_URL',
  INVALID_IDP_TYPE = 'INVALID_IDP_TYPE',
  UNKNOWN_SSO_CONFIGURATION_ERROR = 'UNKNOWN_SSO_CONFIGURATION_ERROR',
  SSO_DISABLE = 'SSO_DISABLE',
}

const ssoExceptionUserFriendlyMessages: Record<
  SSOExceptionCode,
  MessageDescriptor
> = {
  [SSOExceptionCode.USER_NOT_FOUND]: msg`User not found.`,
  [SSOExceptionCode.IDENTITY_PROVIDER_NOT_FOUND]: msg`Identity provider not found.`,
  [SSOExceptionCode.INVALID_ISSUER_URL]: msg`Invalid issuer URL.`,
  [SSOExceptionCode.INVALID_IDP_TYPE]: msg`Invalid identity provider type.`,
  [SSOExceptionCode.UNKNOWN_SSO_CONFIGURATION_ERROR]: msg`SSO configuration error.`,
  [SSOExceptionCode.SSO_DISABLE]: msg`SSO is disabled.`,
};

export class SSOException extends CustomException<SSOExceptionCode> {
  constructor(
    message: string,
    code: SSOExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? ssoExceptionUserFriendlyMessages[code],
    });
  }
}
