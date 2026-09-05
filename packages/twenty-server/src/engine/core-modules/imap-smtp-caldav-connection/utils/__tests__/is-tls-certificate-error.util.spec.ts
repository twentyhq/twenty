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

  it('returns true for nodemailer ESOCKET errors wrapping TLS certificate failures', () => {
    expect(
      isTlsCertificateError(
        Object.assign(new Error('self signed certificate'), {
          code: 'ESOCKET',
          command: 'CONN',
        }),
      ),
    ).toBe(true);
    expect(
      isTlsCertificateError({
        code: 'ESOCKET',
        command: 'CONN',
        message: 'self-signed certificate in certificate chain',
      }),
    ).toBe(true);
    expect(
      isTlsCertificateError(
        Object.assign(new Error('unable to verify the first certificate'), {
          code: 'ESOCKET',
        }),
      ),
    ).toBe(true);
    expect(
      isTlsCertificateError(
        Object.assign(new Error('unable to get local issuer certificate'), {
          code: 'ESOCKET',
        }),
      ),
    ).toBe(true);
    expect(
      isTlsCertificateError(
        Object.assign(new Error('unable to get issuer certificate'), {
          code: 'ESOCKET',
        }),
      ),
    ).toBe(true);
    expect(
      isTlsCertificateError(
        Object.assign(new Error('certificate has expired'), {
          code: 'ESOCKET',
        }),
      ),
    ).toBe(true);
    expect(
      isTlsCertificateError(
        Object.assign(new Error('certificate is not yet valid'), {
          code: 'ESOCKET',
        }),
      ),
    ).toBe(true);
    expect(
      isTlsCertificateError(
        Object.assign(
          new Error("Hostname/IP does not match certificate's altnames"),
          { code: 'ESOCKET' },
        ),
      ),
    ).toBe(true);
  });

  it('returns false for ESOCKET errors unrelated to certificates', () => {
    expect(
      isTlsCertificateError(
        Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:587'), {
          code: 'ESOCKET',
        }),
      ),
    ).toBe(false);
    expect(
      isTlsCertificateError(
        Object.assign(new Error('connection timeout'), { code: 'ESOCKET' }),
      ),
    ).toBe(false);
    expect(
      isTlsCertificateError(
        Object.assign(new Error('getaddrinfo ENOTFOUND smtp.example.com'), {
          code: 'ESOCKET',
        }),
      ),
    ).toBe(false);
    expect(
      isTlsCertificateError(
        Object.assign(new Error('wrong password'), { code: 'ESOCKET' }),
      ),
    ).toBe(false);
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
