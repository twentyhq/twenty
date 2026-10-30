import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { buildImapTlsOptions } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/build-imap-tls-options.util';

describe('buildImapTlsOptions', () => {
  it('negotiates TLS at connection time for SSL_TLS', () => {
    expect(buildImapTlsOptions(EmailConnectionSecurity.SSL_TLS)).toEqual({
      secure: true,
    });
  });

  it('requires the STARTTLS upgrade so a stripped capability cannot downgrade to plaintext', () => {
    expect(buildImapTlsOptions(EmailConnectionSecurity.STARTTLS)).toEqual({
      secure: false,
      doSTARTTLS: true,
    });
  });

  it('forces plaintext for NONE by disabling the STARTTLS upgrade', () => {
    expect(buildImapTlsOptions(EmailConnectionSecurity.NONE)).toEqual({
      secure: false,
      doSTARTTLS: false,
    });
  });
});
