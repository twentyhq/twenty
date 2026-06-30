import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { buildImapTlsOptions } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/build-imap-tls-options.util';

describe('buildImapTlsOptions', () => {
  it('negotiates TLS at connection time for SSL_TLS', () => {
    expect(buildImapTlsOptions(EmailConnectionSecurity.SSL_TLS)).toEqual({
      secure: true,
    });
  });

  it('upgrades opportunistically via STARTTLS when the server offers it', () => {
    expect(buildImapTlsOptions(EmailConnectionSecurity.STARTTLS)).toEqual({
      secure: false,
    });
  });

  it('forces plaintext for NONE by disabling the STARTTLS upgrade', () => {
    expect(buildImapTlsOptions(EmailConnectionSecurity.NONE)).toEqual({
      secure: false,
      doSTARTTLS: false,
    });
  });
});
