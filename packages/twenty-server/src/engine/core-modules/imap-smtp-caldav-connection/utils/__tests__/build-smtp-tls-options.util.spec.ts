import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { buildSmtpTlsOptions } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/build-smtp-tls-options.util';

describe('buildSmtpTlsOptions', () => {
  it('negotiates TLS at connection time for SSL_TLS', () => {
    expect(buildSmtpTlsOptions(EmailConnectionSecurity.SSL_TLS)).toEqual({
      secure: true,
    });
  });

  it('upgrades opportunistically via STARTTLS when the server offers it', () => {
    expect(buildSmtpTlsOptions(EmailConnectionSecurity.STARTTLS)).toEqual({
      secure: false,
    });
  });

  it('forces plaintext for NONE by skipping the STARTTLS upgrade entirely', () => {
    expect(buildSmtpTlsOptions(EmailConnectionSecurity.NONE)).toEqual({
      secure: false,
      ignoreTLS: true,
    });
  });
});
