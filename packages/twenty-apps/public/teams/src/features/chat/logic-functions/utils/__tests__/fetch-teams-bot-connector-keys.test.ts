import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_BOT_OPENID_KEYS_URL } from 'src/features/chat/logic-functions/constants/teams-bot-openid-keys-url';
import { fetchTeamsBotConnectorKeys } from 'src/features/chat/logic-functions/utils/fetch-teams-bot-connector-keys';

const fetchMock = vi.fn();

const TEAMS_KEY = {
  kty: 'RSA',
  use: 'sig',
  kid: 'teams-key',
  n: 'modulus',
  e: 'AQAB',
  x5c: ['certificate'],
  x5t: 'thumbprint',
  endorsements: ['skype', 'msteams'],
};

const respondWith = (body: unknown) =>
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json' },
    }),
  );

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchTeamsBotConnectorKeys', () => {
  it('should keep only the verification fields of keys endorsed for Teams', async () => {
    respondWith({
      keys: [
        TEAMS_KEY,
        { ...TEAMS_KEY, kid: 'telephony-key', endorsements: ['telephony'] },
        { ...TEAMS_KEY, kid: 'unendorsed-key', endorsements: undefined },
        { ...TEAMS_KEY, kid: '' },
        'not-a-key',
      ],
    });

    expect(await fetchTeamsBotConnectorKeys()).toEqual([
      {
        kty: 'RSA',
        use: 'sig',
        kid: 'teams-key',
        n: 'modulus',
        e: 'AQAB',
        endorsements: ['skype', 'msteams'],
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(TEAMS_BOT_OPENID_KEYS_URL);
  });

  it('should drop keys that cannot verify an RS256 signature', async () => {
    respondWith({
      keys: [
        TEAMS_KEY,
        { ...TEAMS_KEY, kid: 'elliptic-curve-key', kty: 'EC', n: undefined },
        { ...TEAMS_KEY, kid: 'encryption-key', use: 'enc' },
        { ...TEAMS_KEY, kid: 'exponent-less-key', e: undefined },
      ],
    });

    expect(await fetchTeamsBotConnectorKeys()).toEqual([
      {
        kty: 'RSA',
        use: 'sig',
        kid: 'teams-key',
        n: 'modulus',
        e: 'AQAB',
        endorsements: ['skype', 'msteams'],
      },
    ]);
  });

  it('should reject a response with no key endorsed for Teams rather than cache an empty set', async () => {
    respondWith({
      keys: [
        { ...TEAMS_KEY, kid: 'telephony-key', endorsements: ['telephony'] },
      ],
    });

    await expect(fetchTeamsBotConnectorKeys()).rejects.toThrow(
      'no key endorsed for Teams',
    );
  });
});
