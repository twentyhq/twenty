import { buildImapTlsOptions } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/build-imap-tls-options.util';

describe('buildImapTlsOptions', () => {
  it('negotiates TLS at connection time for SSL_TLS', () => {
    expect(buildImapTlsOptions('SSL_TLS')).toEqual({ secure: true });
  });

  it('upgrades opportunistically via STARTTLS when the server offers it', () => {
    expect(buildImapTlsOptions('STARTTLS')).toEqual({ secure: false });
  });

  it('forces plaintext for NONE by disabling the STARTTLS upgrade', () => {
    expect(buildImapTlsOptions('NONE')).toEqual({
      secure: false,
      doSTARTTLS: false,
    });
  });
});
