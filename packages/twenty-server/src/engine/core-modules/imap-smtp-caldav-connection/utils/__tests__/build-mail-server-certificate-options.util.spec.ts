import { buildMailServerCertificateOptions } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/build-mail-server-certificate-options.util';

describe('buildMailServerCertificateOptions', () => {
  it('verifies the certificate against the configured hostname by default', () => {
    expect(
      buildMailServerCertificateOptions({
        host: 'imap.example.com',
        allowSelfSigned: false,
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
        allowSelfSigned: true,
      }),
    ).toEqual({
      rejectUnauthorized: false,
      servername: 'mail.internal',
    });
  });

  it('omits the servername for IP literals, which are not valid SNI values', () => {
    expect(
      buildMailServerCertificateOptions({
        host: '192.168.1.10',
        allowSelfSigned: false,
      }),
    ).toEqual({ rejectUnauthorized: true });
  });
});
