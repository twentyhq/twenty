import { SignJWT, generateKeyPair } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';

import { TEAMS_BOT_CONNECTOR_ISSUER } from 'src/logic-functions/constants/teams-bot-connector-issuer';
import { verifyTeamsActivityTokenOrThrow } from 'src/logic-functions/utils/verify-teams-activity-token';

const BOT_APP_ID = 'bbbbbbbb-1111-2222-3333-444444444444';
const SERVICE_URL = 'https://smba.trafficmanager.net/amer/';
const NORMALIZED_SERVICE_URL = 'https://smba.trafficmanager.net/amer';

let privateKey: CryptoKey;
let publicKey: CryptoKey;
let symmetricSecret: Uint8Array;

const signActivityToken = async ({
  issuer = TEAMS_BOT_CONNECTOR_ISSUER,
  audience = BOT_APP_ID,
  serviceUrlClaim = SERVICE_URL,
  claimName = 'serviceurl',
  expiresIn = '5m',
}: {
  issuer?: string;
  audience?: string;
  serviceUrlClaim?: string | null;
  claimName?: 'serviceurl' | 'serviceUrl';
  expiresIn?: string | number;
} = {}) => {
  const payload =
    serviceUrlClaim === null ? {} : { [claimName]: serviceUrlClaim };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey);
};

const verify = (token: string, activityServiceUrl = SERVICE_URL) =>
  verifyTeamsActivityTokenOrThrow({
    authorizationHeader: `Bearer ${token}`,
    activityServiceUrl,
    botAppId: BOT_APP_ID,
    keySet: publicKey,
  });

beforeAll(async () => {
  const pair = await generateKeyPair('RS256', { extractable: true });

  privateKey = pair.privateKey;
  publicKey = pair.publicKey;
  symmetricSecret = new Uint8Array(32).fill(7);
});

describe('verifyTeamsActivityTokenOrThrow', () => {
  it('should return the verified service url for a well-formed Bot Connector token', async () => {
    expect(await verify(await signActivityToken())).toBe(
      NORMALIZED_SERVICE_URL,
    );
  });

  it('should accept the documented serviceUrl spelling as well as the wire one', async () => {
    expect(
      await verify(await signActivityToken({ claimName: 'serviceUrl' })),
    ).toBe(NORMALIZED_SERVICE_URL);
  });

  it('should ignore a trailing slash difference between claim and activity', async () => {
    expect(
      await verify(
        await signActivityToken({ serviceUrlClaim: SERVICE_URL }),
        NORMALIZED_SERVICE_URL,
      ),
    ).toBe(NORMALIZED_SERVICE_URL);
  });

  it('should ignore host casing between claim and activity', async () => {
    expect(
      await verify(
        await signActivityToken({
          serviceUrlClaim: 'https://SMBA.TrafficManager.net/amer/',
        }),
      ),
    ).toBe(NORMALIZED_SERVICE_URL);
  });

  it('should reject a missing Authorization header', async () => {
    await expect(
      verifyTeamsActivityTokenOrThrow({
        authorizationHeader: undefined,
        activityServiceUrl: SERVICE_URL,
        botAppId: BOT_APP_ID,
        keySet: publicKey,
      }),
    ).rejects.toThrow('Missing or malformed Authorization header');
  });

  it('should reject a non-Bearer scheme', async () => {
    await expect(
      verifyTeamsActivityTokenOrThrow({
        authorizationHeader: `Basic ${await signActivityToken()}`,
        activityServiceUrl: SERVICE_URL,
        botAppId: BOT_APP_ID,
        keySet: publicKey,
      }),
    ).rejects.toThrow('Missing or malformed Authorization header');
  });

  it('should reject an Authorization header carrying more than a scheme and a token', async () => {
    await expect(
      verifyTeamsActivityTokenOrThrow({
        authorizationHeader: `Bearer ${await signActivityToken()} extra`,
        activityServiceUrl: SERVICE_URL,
        botAppId: BOT_APP_ID,
        keySet: publicKey,
      }),
    ).rejects.toThrow('Missing or malformed Authorization header');
  });

  it('should reject a token from another issuer', async () => {
    await expect(
      verify(await signActivityToken({ issuer: 'https://evil.example' })),
    ).rejects.toThrow();
  });

  it('should reject a token minted for another bot', async () => {
    await expect(
      verify(await signActivityToken({ audience: 'someone-elses-app-id' })),
    ).rejects.toThrow();
  });

  it('should reject an expired token beyond the clock tolerance', async () => {
    await expect(
      verify(await signActivityToken({ expiresIn: '-10m' })),
    ).rejects.toThrow();
  });

  it('should reject a token whose serviceUrl claim points elsewhere', async () => {
    await expect(
      verify(
        await signActivityToken({
          serviceUrlClaim: 'https://attacker.example',
        }),
      ),
    ).rejects.toThrow('does not match the serviceUrl claim');
  });

  it('should reject a token carrying no serviceUrl claim', async () => {
    await expect(
      verify(await signActivityToken({ serviceUrlClaim: null })),
    ).rejects.toThrow('has no serviceUrl claim');
  });

  it('should reject a symmetrically signed token, so alg cannot be downgraded', async () => {
    const forgedToken = await new SignJWT({ serviceurl: SERVICE_URL })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(TEAMS_BOT_CONNECTOR_ISSUER)
      .setAudience(BOT_APP_ID)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(symmetricSecret);

    await expect(
      verifyTeamsActivityTokenOrThrow({
        authorizationHeader: `Bearer ${forgedToken}`,
        activityServiceUrl: SERVICE_URL,
        botAppId: BOT_APP_ID,
        keySet: symmetricSecret,
      }),
    ).rejects.toThrow();
  });
});
