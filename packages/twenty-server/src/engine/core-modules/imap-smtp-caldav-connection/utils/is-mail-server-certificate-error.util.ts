import { isObject, isString } from '@sniptt/guards';

const MAIL_SERVER_CERTIFICATE_ERROR_CODES = new Set([
  'CERT_HAS_EXPIRED',
  'CERT_NOT_YET_VALID',
  'CERT_REVOKED',
  'CERT_SIGNATURE_FAILURE',
  'CERT_UNTRUSTED',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
]);

export const isMailServerCertificateError = (error: unknown): boolean =>
  isObject(error) &&
  'code' in error &&
  isString(error.code) &&
  MAIL_SERVER_CERTIFICATE_ERROR_CODES.has(error.code);
