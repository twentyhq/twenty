import { generateKeyPairSync, randomUUID } from 'crypto';

import {
  computeJwkThumbprint,
  JwtKeyManagerService,
} from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';

const generateEs256PemPair = () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
  });

  return {
    privatePem: privateKey.export({ format: 'pem', type: 'pkcs8' }).toString(),
    publicPem: publicKey.export({ format: 'pem', type: 'spki' }).toString(),
    publicJwk: publicKey.export({ format: 'jwk' }),
  };
};

const buildRepository = (initialRows: Array<Record<string, unknown>> = []) => {
  const rows = [...initialRows];

  const findOne = jest.fn(async ({ where }: { where: { kid: string } }) => {
    return rows.find((row) => row.kid === where.kid) ?? null;
  });

  const insert = jest.fn(async (row: Record<string, unknown>) => {
    rows.push(row);

    return {};
  });

  return {
    repo: { findOne, insert } as any,
    rows: () => rows,
    findOne,
    insert,
  };
};

const buildConfig = (
  values: Record<string, string | undefined>,
): { get: jest.Mock } => ({
  get: jest.fn((key: string) => values[key]),
});

describe('JwtKeyManagerService', () => {
  describe('computeJwkThumbprint', () => {
    it('matches the RFC 7638 reference vector for an RSA JWK', () => {
      const referenceJwk = {
        kty: 'RSA',
        n: '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw',
        e: 'AQAB',
      } as const;

      expect(computeJwkThumbprint(referenceJwk)).toBe(
        'NzbLsXh8uDCcd-6MNwXF4W_7noWXFZAfHkxZsRGC9Xs',
      );
    });

    it('produces the same thumbprint regardless of EC JWK property order', () => {
      const { publicJwk } = generateEs256PemPair();

      const orderedA = {
        crv: publicJwk.crv,
        kty: publicJwk.kty,
        x: publicJwk.x,
        y: publicJwk.y,
      };
      const orderedB = {
        y: publicJwk.y,
        x: publicJwk.x,
        kty: publicJwk.kty,
        crv: publicJwk.crv,
      };

      expect(computeJwkThumbprint(orderedA)).toBe(
        computeJwkThumbprint(orderedB),
      );
    });
  });

  describe('getCurrentSigningKey', () => {
    it('returns null when JWT_SIGNING_PRIVATE_KEY is not set', async () => {
      const config = buildConfig({ JWT_SIGNING_PRIVATE_KEY: undefined });
      const { repo } = buildRepository();

      const service = new JwtKeyManagerService(config as any, repo);

      await expect(service.getCurrentSigningKey()).resolves.toBeNull();
    });

    it('returns null when JWT_SIGNING_PRIVATE_KEY is malformed', async () => {
      const config = buildConfig({ JWT_SIGNING_PRIVATE_KEY: 'not-a-pem' });
      const { repo } = buildRepository();

      const service = new JwtKeyManagerService(config as any, repo);

      await expect(service.getCurrentSigningKey()).resolves.toBeNull();
    });

    it('returns null when JWT_SIGNING_PRIVATE_KEY is RSA (not ES256)', async () => {
      const { privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
      });
      const pem = privateKey
        .export({ format: 'pem', type: 'pkcs8' })
        .toString();

      const config = buildConfig({ JWT_SIGNING_PRIVATE_KEY: pem });
      const { repo } = buildRepository();

      const service = new JwtKeyManagerService(config as any, repo);

      await expect(service.getCurrentSigningKey()).resolves.toBeNull();
    });

    it('lazily upserts the public key on first call and returns the same object on subsequent calls', async () => {
      const { privatePem } = generateEs256PemPair();
      const config = buildConfig({ JWT_SIGNING_PRIVATE_KEY: privatePem });
      const { repo, rows, insert, findOne } = buildRepository();

      const service = new JwtKeyManagerService(config as any, repo);

      const first = await service.getCurrentSigningKey();
      const second = await service.getCurrentSigningKey();

      expect(first).not.toBeNull();
      expect(second).toBe(first);
      expect(rows()).toHaveLength(1);
      expect(insert).toHaveBeenCalledTimes(1);
      expect(findOne).toHaveBeenCalledTimes(1);
    });

    it('does not insert again when the public key row is already present', async () => {
      const { privatePem, publicJwk } = generateEs256PemPair();
      const expectedKid = computeJwkThumbprint(publicJwk);

      const config = buildConfig({ JWT_SIGNING_PRIVATE_KEY: privatePem });
      const { repo, insert } = buildRepository([
        { kid: expectedKid, publicKey: 'whatever', algorithm: 'ES256' },
      ]);

      const service = new JwtKeyManagerService(config as any, repo);

      const result = await service.getCurrentSigningKey();

      expect(result?.kid).toBe(expectedKid);
      expect(insert).not.toHaveBeenCalled();
    });
  });

  describe('getPublicKeyByKid', () => {
    it('returns null for an unknown kid', async () => {
      const config = buildConfig({});
      const { repo } = buildRepository();

      const service = new JwtKeyManagerService(config as any, repo);

      await expect(service.getPublicKeyByKid(randomUUID())).resolves.toBeNull();
    });

    it('resolves a previously persisted public key (rotation safety)', async () => {
      const previous = generateEs256PemPair();
      const previousKid = computeJwkThumbprint(previous.publicJwk);
      const current = generateEs256PemPair();

      const config = buildConfig({
        JWT_SIGNING_PRIVATE_KEY: current.privatePem,
      });
      const { repo, rows } = buildRepository([
        { kid: previousKid, publicKey: previous.publicPem, algorithm: 'ES256' },
      ]);

      const service = new JwtKeyManagerService(config as any, repo);

      const signingKey = await service.getCurrentSigningKey();

      expect(signingKey?.kid).not.toBe(previousKid);
      expect(rows()).toHaveLength(2);

      const resolved = await service.getPublicKeyByKid(previousKid);

      expect(resolved).not.toBeNull();
      expect(resolved?.asymmetricKeyType).toBe('ec');
    });

    it('caches resolved public keys (no extra DB hit on second lookup)', async () => {
      const { privatePem, publicPem, publicJwk } = generateEs256PemPair();
      const kid = computeJwkThumbprint(publicJwk);

      const config = buildConfig({ JWT_SIGNING_PRIVATE_KEY: privatePem });
      const { repo, findOne } = buildRepository([
        { kid, publicKey: publicPem, algorithm: 'ES256' },
      ]);

      const service = new JwtKeyManagerService(config as any, repo);

      const first = await service.getPublicKeyByKid(kid);
      const second = await service.getPublicKeyByKid(kid);

      expect(first).toBe(second);
      expect(findOne).toHaveBeenCalledTimes(1);
    });
  });
});
