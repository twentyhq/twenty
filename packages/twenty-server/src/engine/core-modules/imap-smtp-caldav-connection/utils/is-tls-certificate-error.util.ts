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

/**
 * Nodemailer's verify() wraps TLS handshake failures into errors whose only
 * distinctive top-level property is code: 'ESOCKET' (no reason, no original
 * TLS error code). The underlying OpenSSL failure only survives in the
 * message, so certificate failures are also detected by message phrasing.
 */
const TLS_CERTIFICATE_ERROR_MESSAGE_PATTERNS: RegExp[] = [
  /self[- ]signed certificate/i,
  /unable to verify (?:the first certificate|the leaf certificate|leaf signature)/i,
  /unable to get (?:local )?issuer certificate/i,
  /certificate has expired/i,
  /certificate is not yet valid/i,
  /hostname\/ip does not match certificate's altnames/i,
];

export const isTlsCertificateError = (error: unknown): boolean => {
  if (
    !isDefined(error) ||
    typeof error !== 'object' ||
    !('code' in error) ||
    typeof error.code !== 'string'
  ) {
    return false;
  }

  if (TLS_CERTIFICATE_ERROR_CODES[error.code] === true) {
    return true;
  }

  return (
    error.code === 'ESOCKET' &&
    'message' in error &&
    typeof error.message === 'string' &&
    TLS_CERTIFICATE_ERROR_MESSAGE_PATTERNS.some((pattern) =>
      pattern.test(error.message),
    )
  );
};
