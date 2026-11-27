export const CERTIFICATE_ERROR_MESSAGES: Partial<Record<string, string>> = {
  CERT_HAS_EXPIRED: 'The server TLS certificate has expired.',
  CERT_NOT_YET_VALID: 'The server TLS certificate is not yet valid.',
  DEPTH_ZERO_SELF_SIGNED_CERT:
    'The server uses an untrusted self-signed TLS certificate.',
  ERR_TLS_CERT_ALTNAME_INVALID:
    'The server TLS certificate does not match its hostname.',
  SELF_SIGNED_CERT_IN_CHAIN:
    'The server TLS certificate chain contains an untrusted self-signed certificate.',
  UNABLE_TO_GET_ISSUER_CERT:
    'The server TLS certificate issuer could not be found.',
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY:
    'The server TLS certificate issuer is not trusted locally.',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE:
    'The server TLS certificate chain could not be verified.',
};
