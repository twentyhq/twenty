import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  type JWTVerifyGetKey,
  type KeyLike,
  SignJWT,
} from 'jose';

import { verifyCloudflareAccessAssertion } from 'src/engine/core-modules/server-admin-access/utils/verify-cloudflare-access-assertion.util';

const TEAM_DOMAIN = 'https://acme.cloudflareaccess.com';
const AUDIENCE = 'admin-console-audience';

describe('verifyCloudflareAccessAssertion', () => {
  let privateKey: KeyLike;
  let keySet: JWTVerifyGetKey;

  beforeAll(async () => {
    const keyPair = await generateKeyPair('RS256');

    privateKey = keyPair.privateKey;
    keySet = createLocalJWKSet({
      keys: [{ ...(await exportJWK(keyPair.publicKey)), kid: 'key-1' }],
    });
  });

  const signAssertion = ({
    email = 'Admin@Example.com',
    issuer = TEAM_DOMAIN,
    audience = AUDIENCE,
    signingKey = privateKey,
  }: {
    email?: string;
    issuer?: string;
    audience?: string;
    signingKey?: KeyLike;
  } = {}) =>
    new SignJWT({ email })
      .setProtectedHeader({ alg: 'RS256', kid: 'key-1' })
      .setIssuer(issuer)
      .setAudience(audience)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(signingKey);

  const verify = (assertion: string | undefined) =>
    verifyCloudflareAccessAssertion({
      assertion,
      teamDomain: TEAM_DOMAIN,
      audience: AUDIENCE,
      keySet,
    });

  it('returns the lowercased email of a valid assertion', async () => {
    await expect(verify(await signAssertion())).resolves.toBe(
      'admin@example.com',
    );
  });

  it('rejects a missing assertion', async () => {
    await expect(verify(undefined)).resolves.toBeUndefined();
  });

  it('rejects an assertion for another Access application', async () => {
    await expect(
      verify(await signAssertion({ audience: 'another-application' })),
    ).resolves.toBeUndefined();
  });

  it('rejects an assertion from another team', async () => {
    await expect(
      verify(
        await signAssertion({ issuer: 'https://other.cloudflareaccess.com' }),
      ),
    ).resolves.toBeUndefined();
  });

  it('rejects an assertion signed with an unknown key', async () => {
    const { privateKey: attackerKey } = await generateKeyPair('RS256');

    await expect(
      verify(await signAssertion({ signingKey: attackerKey })),
    ).resolves.toBeUndefined();
  });
});
