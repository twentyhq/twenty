import { isDefined } from 'twenty-shared/utils';

const TLS_CERTIFICATE_ERROR_CODES: Record<string, true> = {
  SELF_SIGNED_CERT_IN_CHAIN: true,
  DEPTH_ZERO_SELF_SIGNED_CERT: true,
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: true,
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: true,
  CERT_HAS_EXPIRED: true,
  CERT_NOT_YET_VALID: true,
  ERR_TLS_CERT_ALTNAME_INVALID: true,
};

export const isTlsCertificateError = (error: unknown): boolean =>
  isDefined(error) &&
  typeof error === 'object' &&
  'code' in error &&
  typeof error.code === 'string' &&
  TLS_CERTIFICATE_ERROR_CODES[error.code] === true;
