import { SignJWT, exportJWK, generateKeyPair } from 'jose';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_BOT_CONNECTOR_ISSUER } from 'src/features/chat/logic-functions/constants/teams-bot-connector-issuer';
import { TEAMS_CHANNEL_ID } from 'src/features/chat/logic-functions/constants/teams-channel-id';
import { type TeamsBotConnectorKey } from 'src/features/chat/logic-functions/types/teams-bot-connector-key.type';
import { verifyTeamsActivityTokenOrThrow } from 'src/features/chat/logic-functions/utils/verify-teams-activity-token';

const BOT_APP_ID = 'bbbbbbbb-1111-2222-3333-444444444444';
const SERVICE_URL = 'https://smba.trafficmanager.net/amer/';
const NORMALIZED_SERVICE_URL = 'https://smba.trafficmanager.net/amer';
const KEY_ID = 'teams-signing-key';
const OTHER_CHANNEL_KEY_ID = 'skype-signing-key';
const ROTATED_KEY_ID = 'rotated-signing-key';

let privateKey: CryptoKey;
let teamsKey: TeamsBotConnectorKey;
let otherChannelKey: TeamsBotConnectorKey;
let symmetricSecret: Uint8Array;

const loadKeysMock =
  vi.fn<
    (options?: { forceRefresh?: boolean }) => Promise<TeamsBotConnectorKey[]>
  >();

const signActivityToken = async ({
  issuer = TEAMS_BOT_CONNECTOR_ISSUER,
  audience = BOT_APP_ID,
  serviceUrlClaim = SERVICE_URL,
  claimName = 'serviceurl',
  expiresIn = '5m',
  keyId = KEY_ID,
}: {
  issuer?: string;
  audience?: string;
  serviceUrlClaim?: string | null;
  claimName?: 'serviceurl' | 'serviceUrl';
  expiresIn?: string | number;
  keyId?: string | null;
} = {}) => {
  const payload =
    serviceUrlClaim === null ? {} : { [claimName]: serviceUrlClaim };

  return new SignJWT(payload)
    .setProtectedHeader(
      keyId === null ? { alg: 'RS256' } : { alg: 'RS256', kid: keyId },
    )
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey);
};

const verify = (
  authorizationHeader: string | undefined,
  activityServiceUrl = SERVICE_URL,
) =>
  verifyTeamsActivityTokenOrThrow({
    authorizationHeader,
    activityServiceUrl,
    botAppId: BOT_APP_ID,
    loadKeys: loadKeysMock,
  });

const verifyToken = (token: string, activityServiceUrl = SERVICE_URL) =>
  verify(`Bearer ${token}`, activityServiceUrl);

beforeAll(async () => {
  const pair = await generateKeyPair('RS256', { extractable: true });
  const publicJwk = await exportJWK(pair.publicKey);

  privateKey = pair.privateKey;
  teamsKey = {
    ...publicJwk,
    kid: KEY_ID,
    endorsements: ['skype', TEAMS_CHANNEL_ID],
  };
  otherChannelKey = {
    ...publicJwk,
    kid: OTHER_CHANNEL_KEY_ID,
    endorsements: ['directlinespeech', 'telephony'],
  };
  symmetricSecret = new Uint8Array(32).fill(7);
});

beforeEach(() => {
  loadKeysMock.mockReset();
  loadKeysMock.mockResolvedValue([teamsKey, otherChannelKey]);
});

describe('verifyTeamsActivityTokenOrThrow', () => {
  it('should return the verified service url for a well-formed Bot Connector token', async () => {
    expect(await verifyToken(await signActivityToken())).toBe(
      NORMALIZED_SERVICE_URL,
    );
  });

  it('should accept the documented serviceUrl spelling as well as the wire one', async () => {
    expect(
      await verifyToken(await signActivityToken({ claimName: 'serviceUrl' })),
    ).toBe(NORMALIZED_SERVICE_URL);
  });

  it('should ignore a trailing slash difference between claim and activity', async () => {
    expect(
      await verifyToken(
        await signActivityToken({ serviceUrlClaim: SERVICE_URL }),
        NORMALIZED_SERVICE_URL,
      ),
    ).toBe(NORMALIZED_SERVICE_URL);
  });

  it('should ignore host casing between claim and activity', async () => {
    expect(
      await verifyToken(
        await signActivityToken({
          serviceUrlClaim: 'https://SMBA.TrafficManager.net/amer/',
        }),
      ),
    ).toBe(NORMALIZED_SERVICE_URL);
  });

  it('should refetch the key set once when the token names a rotated key', async () => {
    const rotatedTeamsKey = { ...teamsKey, kid: ROTATED_KEY_ID };

    loadKeysMock
      .mockResolvedValueOnce([teamsKey])
      .mockResolvedValueOnce([rotatedTeamsKey]);

    expect(
      await verifyToken(await signActivityToken({ keyId: ROTATED_KEY_ID })),
    ).toBe(NORMALIZED_SERVICE_URL);
    expect(loadKeysMock).toHaveBeenNthCalledWith(1);
    expect(loadKeysMock).toHaveBeenNthCalledWith(2, { forceRefresh: true });
  });

  it('should reject a missing Authorization header', async () => {
    await expect(verify(undefined)).rejects.toThrow(
      'Missing or malformed Authorization header',
    );
  });

  it('should reject a non-Bearer scheme', async () => {
    await expect(verify(`Basic ${await signActivityToken()}`)).rejects.toThrow(
      'Missing or malformed Authorization header',
    );
  });

  it('should reject an Authorization header carrying more than a scheme and a token', async () => {
    await expect(
      verify(`Bearer ${await signActivityToken()} extra`),
    ).rejects.toThrow('Missing or malformed Authorization header');
  });

  it('should reject a token signed with a key the Bot Connector does not publish', async () => {
    await expect(
      verifyToken(await signActivityToken({ keyId: 'unknown-key' })),
    ).rejects.toThrow('does not publish');
    expect(loadKeysMock).toHaveBeenCalledTimes(2);
  });

  it('should reject a validly signed token whose key is endorsed for another channel', async () => {
    await expect(
      verifyToken(await signActivityToken({ keyId: OTHER_CHANNEL_KEY_ID })),
    ).rejects.toThrow('not endorsed for Teams');
  });

  it('should reject a token from another issuer', async () => {
    await expect(
      verifyToken(await signActivityToken({ issuer: 'https://evil.example' })),
    ).rejects.toThrow();
  });

  it('should reject a token minted for another bot', async () => {
    await expect(
      verifyToken(
        await signActivityToken({ audience: 'someone-elses-app-id' }),
      ),
    ).rejects.toThrow();
  });

  it('should reject an expired token beyond the clock tolerance', async () => {
    await expect(
      verifyToken(await signActivityToken({ expiresIn: '-10m' })),
    ).rejects.toThrow();
  });

  it('should reject a token whose serviceUrl claim points elsewhere', async () => {
    await expect(
      verifyToken(
        await signActivityToken({
          serviceUrlClaim: 'https://attacker.example',
        }),
      ),
    ).rejects.toThrow('does not match the serviceUrl claim');
  });

  it('should reject a token carrying no serviceUrl claim', async () => {
    await expect(
      verifyToken(await signActivityToken({ serviceUrlClaim: null })),
    ).rejects.toThrow('has no serviceUrl claim');
  });

  it('should reject a symmetrically signed token naming a published key, so alg cannot be downgraded', async () => {
    const forgedToken = await new SignJWT({ serviceurl: SERVICE_URL })
      .setProtectedHeader({ alg: 'HS256', kid: KEY_ID })
      .setIssuer(TEAMS_BOT_CONNECTOR_ISSUER)
      .setAudience(BOT_APP_ID)
      .setIssuedAt()
      .setExpirationTime('5m')
      .sign(symmetricSecret);

    await expect(verifyToken(forgedToken)).rejects.toThrow();
  });
});
