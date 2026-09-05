import { isTlsCertificateError } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/is-tls-certificate-error.util';

describe('isTlsCertificateError', () => {
  it('returns true for Node TLS certificate error codes', () => {
    expect(
      isTlsCertificateError(
        Object.assign(new Error('self signed certificate'), {
          code: 'SELF_SIGNED_CERT_IN_CHAIN',
        }),
      ),
    ).toBe(true);
    expect(
      isTlsCertificateError({ code: 'DEPTH_ZERO_SELF_SIGNED_CERT' }),
    ).toBe(true);
    expect(
      isTlsCertificateError({ code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' }),
    ).toBe(true);
    expect(
      isTlsCertificateError({ code: 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' }),
    ).toBe(true);
    expect(isTlsCertificateError({ code: 'CERT_HAS_EXPIRED' })).toBe(true);
    expect(isTlsCertificateError({ code: 'ERR_TLS_CERT_ALTNAME_INVALID' })).toBe(
      true,
    );
  });

  it('returns false for non-certificate errors', () => {
    expect(isTlsCertificateError({ code: 'ECONNREFUSED' })).toBe(false);
    expect(isTlsCertificateError(new Error('plain error'))).toBe(false);
    expect(isTlsCertificateError('string error')).toBe(false);
    expect(isTlsCertificateError(null)).toBe(false);
    expect(isTlsCertificateError(undefined)).toBe(false);
    expect(isTlsCertificateError(42)).toBe(false);
  });

  it('returns false when code is not a string', () => {
    expect(isTlsCertificateError({ code: 500 })).toBe(false);
    expect(isTlsCertificateError({})).toBe(false);
  });
});
