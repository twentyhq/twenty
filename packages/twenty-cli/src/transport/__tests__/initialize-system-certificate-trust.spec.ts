import { execFileSync } from 'node:child_process';
import { X509Certificate } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer, get, type Server } from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import tls from 'node:tls';

import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { initializeSystemCertificateTrust } from '@/transport/initialize-system-certificate-trust';
import { getListeningPort } from '@/utils/get-listening-port';

const originalGetCertificates = tls.getCACertificates;
const originalCertificates = tls.getCACertificates('default');
const directory = mkdtempSync(join(tmpdir(), 'twenty-certificate-trust-'));
const servers: Server[] = [];

const createCertificate = (name: string) => {
  const keyPath = join(directory, `${name}.key`);
  const certificatePath = join(directory, `${name}.pem`);

  execFileSync(
    'openssl',
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-days',
      '1',
      '-keyout',
      keyPath,
      '-out',
      certificatePath,
      '-subj',
      `/CN=${name}`,
      '-addext',
      'subjectAltName=IP:127.0.0.1',
    ],
    { stdio: 'ignore' },
  );

  return {
    key: readFileSync(keyPath),
    cert: readFileSync(certificatePath, 'utf8'),
  };
};

const startServer = async (
  certificate: ReturnType<typeof createCertificate>,
) => {
  const server = createServer(certificate, (_request, response) => {
    response.end('verified');
  });

  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  return `https://127.0.0.1:${getListeningPort(server)}`;
};

const request = (url: string, servername?: string) =>
  new Promise<number | undefined>((resolve, reject) => {
    get(url, { agent: false, servername }, (response) => {
      response.resume();
      response.on('end', () => resolve(response.statusCode));
    }).on('error', reject);
  });

describe('system certificate trust', () => {
  let trustedUrl: string;
  let untrustedUrl: string;
  let systemCertificate: string;

  beforeAll(async () => {
    const trustedCertificate = createCertificate('system-trusted-test');

    systemCertificate = trustedCertificate.cert;
    trustedUrl = await startServer(trustedCertificate);
    untrustedUrl = await startServer(createCertificate('untrusted-test'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    tls.setDefaultCACertificates(originalCertificates);
  });

  afterAll(async () => {
    await Promise.all(
      servers.map(
        (server) =>
          new Promise<void>((resolve) => {
            server.closeAllConnections();
            server.close(() => resolve());
          }),
      ),
    );
    rmSync(directory, { recursive: true, force: true });
  });

  const initializeWithSystemCertificate = () => {
    vi.spyOn(tls, 'getCACertificates').mockImplementation((type) =>
      type === 'system' ? [systemCertificate] : originalGetCertificates(type),
    );
    initializeSystemCertificateTrust();
  };

  it('trusts OS certificates for both HTTPS and fetch while retaining existing roots', async () => {
    await expect(request(trustedUrl)).rejects.toMatchObject({
      code: 'DEPTH_ZERO_SELF_SIGNED_CERT',
    });

    initializeWithSystemCertificate();

    expect(await request(trustedUrl)).toBe(200);
    const response = await fetch(trustedUrl);

    expect(await response.text()).toBe('verified');
    const trustedFingerprints = new Set(
      originalGetCertificates('default').map(
        (certificate) => new X509Certificate(certificate).fingerprint256,
      ),
    );

    expect(
      [...originalCertificates, systemCertificate].every((certificate) =>
        trustedFingerprints.has(
          new X509Certificate(certificate).fingerprint256,
        ),
      ),
    ).toBe(true);
  });

  it('still rejects certificates outside the trusted stores', async () => {
    initializeWithSystemCertificate();

    await expect(request(untrustedUrl)).rejects.toMatchObject({
      code: 'DEPTH_ZERO_SELF_SIGNED_CERT',
    });
    await expect(fetch(untrustedUrl)).rejects.toMatchObject({
      cause: { code: 'DEPTH_ZERO_SELF_SIGNED_CERT' },
    });
  });

  it('still validates the hostname of a trusted certificate', async () => {
    initializeWithSystemCertificate();

    await expect(request(trustedUrl, 'wrong.example')).rejects.toMatchObject({
      code: 'ERR_TLS_CERT_ALTNAME_INVALID',
    });
  });
});
