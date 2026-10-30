import { buildMailServerCertificateOptions } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/build-mail-server-certificate-options.util';

describe('buildMailServerCertificateOptions', () => {
  it('verifies the certificate against the configured hostname by default', () => {
    expect(
      buildMailServerCertificateOptions({
        host: 'imap.example.com',
        isSelfSignedCertificateAllowed: false,
      }),
    ).toEqual({
      rejectUnauthorized: true,
      servername: 'imap.example.com',
    });
  });

  it('accepts unverifiable certificates only when self-signed servers are allowed', () => {
    expect(
      buildMailServerCertificateOptions({
        host: 'mail.internal',
        isSelfSignedCertificateAllowed: true,
      }),
    ).toEqual({
      rejectUnauthorized: false,
      servername: 'mail.internal',
    });
  });

  it('verifies against the hostname when the host was saved as a URL', () => {
    expect(
      buildMailServerCertificateOptions({
        host: 'imaps://mail.example.com:993',
        isSelfSignedCertificateAllowed: false,
      }),
    ).toEqual({
      rejectUnauthorized: true,
      servername: 'mail.example.com',
    });
  });

  it('omits the servername for IP literals, which are not valid SNI values', () => {
    expect(
      buildMailServerCertificateOptions({
        host: '192.168.1.10',
        isSelfSignedCertificateAllowed: false,
      }),
    ).toEqual({ rejectUnauthorized: true });
  });
});
