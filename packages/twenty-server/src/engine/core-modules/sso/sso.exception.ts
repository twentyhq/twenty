/* @license Enterprise */

import { CustomException } from 'src/utils/custom-exception';

export class SSOException extends CustomException {
  code: SSOExceptionCode;
  constructor(message: string, code: SSOExceptionCode) {
    super(message, code);
  }
}

export enum SSOExceptionCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_SSO_CONFIGURATION = 'INVALID_SSO_CONFIGURATION',
  IDENTITY_PROVIDER_NOT_FOUND = 'IDENTITY_PROVIDER_NOT_FOUND',
  INVALID_ISSUER_URL = 'INVALID_ISSUER_URL',
  INVALID_IDP_TYPE = 'INVALID_IDP_TYPE',
  UNKNOWN_SSO_CONFIGURATION_ERROR = 'UNKNOWN_SSO_CONFIGURATION_ERROR',
  SSO_DISABLE = 'SSO_DISABLE',
}
