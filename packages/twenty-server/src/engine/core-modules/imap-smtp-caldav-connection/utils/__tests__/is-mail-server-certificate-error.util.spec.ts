import { isMailServerCertificateError } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/is-mail-server-certificate-error.util';

const buildErrorWithCode = (code: string) =>
  Object.assign(new Error('TLS failure'), { code });

describe('isMailServerCertificateError', () => {
  it.each([
    'CERT_HAS_EXPIRED',
    'DEPTH_ZERO_SELF_SIGNED_CERT',
    'ERR_TLS_CERT_ALTNAME_INVALID',
    'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  ])('detects %s', (code) => {
    expect(isMailServerCertificateError(buildErrorWithCode(code))).toBe(true);
  });

  it('ignores network errors', () => {
    expect(
      isMailServerCertificateError(buildErrorWithCode('ECONNREFUSED')),
    ).toBe(false);
  });

  it('ignores errors without a code', () => {
    expect(isMailServerCertificateError(new Error('boom'))).toBe(false);
    expect(isMailServerCertificateError(undefined)).toBe(false);
  });
});
