import { mapConnectionSecurityToTransport } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/map-connection-security-to-transport.util';

describe('mapConnectionSecurityToTransport', () => {
  it('negotiates TLS at connection time for SSL_TLS without enabling STARTTLS upgrade', () => {
    expect(mapConnectionSecurityToTransport('SSL_TLS')).toEqual({
      secure: true,
    });
  });

  it('enforces the STARTTLS upgrade so the session never silently stays in plaintext', () => {
    expect(mapConnectionSecurityToTransport('STARTTLS')).toEqual({
      secure: false,
      requireTLS: true,
    });
  });

  it('keeps the connection in plaintext for NONE without opportunistically upgrading', () => {
    expect(mapConnectionSecurityToTransport('NONE')).toEqual({
      secure: false,
      ignoreTLS: true,
    });
  });
});
