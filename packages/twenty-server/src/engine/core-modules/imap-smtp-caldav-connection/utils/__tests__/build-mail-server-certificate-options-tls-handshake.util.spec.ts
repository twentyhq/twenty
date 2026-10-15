import { type AddressInfo } from 'net';
import { connect, createServer, type Server } from 'tls';

import { buildMailServerCertificateOptions } from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/build-mail-server-certificate-options.util';
import {
  MAIL_SERVER_TEST_CERTIFICATE,
  MAIL_SERVER_TEST_PRIVATE_KEY,
} from 'src/engine/core-modules/imap-smtp-caldav-connection/utils/__tests__/constants/mail-server-test-certificate.constant';

const handshake = ({
  port,
  host,
  isSelfSignedCertificateAllowed,
  isCertificateTrusted,
}: {
  port: number;
  host: string;
  isSelfSignedCertificateAllowed: boolean;
  isCertificateTrusted: boolean;
}): Promise<void> =>
  new Promise((resolve, reject) => {
    // Connects to the loopback IP like the SSRF guard pins the resolved IP
    const socket = connect({
      host: '127.0.0.1',
      port,
      ...buildMailServerCertificateOptions({
        host,
        isSelfSignedCertificateAllowed,
      }),
      ...(isCertificateTrusted ? { ca: MAIL_SERVER_TEST_CERTIFICATE } : {}),
    });

    socket.once('secureConnect', () => {
      socket.end();
      resolve();
    });
    socket.once('error', reject);
  });

describe('buildMailServerCertificateOptions TLS handshake', () => {
  let server: Server;
  let port: number;

  beforeAll(async () => {
    jest.useRealTimers();

    server = createServer(
      {
        cert: MAIL_SERVER_TEST_CERTIFICATE,
        key: MAIL_SERVER_TEST_PRIVATE_KEY,
      },
      (socket) => socket.end(),
    );

    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );

    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it('rejects a certificate that does not chain to a trusted CA', async () => {
    await expect(
      handshake({
        port,
        host: 'mail.example.test',
        isSelfSignedCertificateAllowed: false,
        isCertificateTrusted: false,
      }),
    ).rejects.toMatchObject({ code: 'DEPTH_ZERO_SELF_SIGNED_CERT' });
  });

  it('rejects a trusted certificate issued for another hostname', async () => {
    await expect(
      handshake({
        port,
        host: 'other.example.test',
        isSelfSignedCertificateAllowed: false,
        isCertificateTrusted: true,
      }),
    ).rejects.toMatchObject({ code: 'ERR_TLS_CERT_ALTNAME_INVALID' });
  });

  it('accepts a trusted certificate for the configured hostname while connected to its IP', async () => {
    await expect(
      handshake({
        port,
        host: 'imaps://mail.example.test:993',
        isSelfSignedCertificateAllowed: false,
        isCertificateTrusted: true,
      }),
    ).resolves.toBeUndefined();
  });

  it('accepts an unverifiable certificate when self-signed servers are allowed', async () => {
    await expect(
      handshake({
        port,
        host: 'mail.example.test',
        isSelfSignedCertificateAllowed: true,
        isCertificateTrusted: false,
      }),
    ).resolves.toBeUndefined();
  });
});
