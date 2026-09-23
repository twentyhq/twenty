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

const respondWith = (body: unknown, status = 200) =>
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
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

  it('should reject a response without a keys array', async () => {
    respondWith({ error: 'unexpected' });

    await expect(fetchTeamsBotConnectorKeys()).rejects.toThrow(
      'carried no keys',
    );
  });

  it('should reject a failed response', async () => {
    respondWith({}, 503);

    await expect(fetchTeamsBotConnectorKeys()).rejects.toThrow('503');
  });
});
