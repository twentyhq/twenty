import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildTeamsConnectorTokenKvKey } from 'src/features/chat/logic-functions/utils/build-teams-connector-token-kv-key';
import { getTeamsConnectorToken } from 'src/features/chat/logic-functions/utils/get-teams-connector-token';
import { TEAMS_TEST_BOT_CREDENTIALS } from 'src/features/chat/__tests__/constants/teams-test-bot-credentials.constant';

const { kvGetMock, kvSetMock, mintMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
  mintMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock },
}));

vi.mock(
  'src/features/chat/logic-functions/utils/mint-teams-connector-token',
  () => ({
    mintTeamsConnectorToken: mintMock,
  }),
);

describe('getTeamsConnectorToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    mintMock.mockResolvedValue({
      accessToken: 'minted',
      expiresAtMs: Date.now() + 3600 * 1000,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should reuse a cached token that is still comfortably valid', async () => {
    kvGetMock.mockResolvedValue({
      accessToken: 'cached',
      expiresAtMs: Date.now() + 30 * 60 * 1000,
    });

    expect(await getTeamsConnectorToken(TEAMS_TEST_BOT_CREDENTIALS)).toBe(
      'cached',
    );
    expect(mintMock).not.toHaveBeenCalled();
  });

  it('should mint and cache at workspace scope when nothing is stored', async () => {
    kvGetMock.mockResolvedValue(null);

    expect(await getTeamsConnectorToken(TEAMS_TEST_BOT_CREDENTIALS)).toBe(
      'minted',
    );
    expect(kvGetMock).toHaveBeenCalledWith(
      buildTeamsConnectorTokenKvKey(TEAMS_TEST_BOT_CREDENTIALS.appId),
    );
    expect(kvSetMock).toHaveBeenCalledWith(
      buildTeamsConnectorTokenKvKey(TEAMS_TEST_BOT_CREDENTIALS.appId),
      {
        accessToken: 'minted',
        expiresAtMs: Date.now() + 3600 * 1000,
      },
    );
  });

  it('should refresh a token that expires inside the refresh margin', async () => {
    kvGetMock.mockResolvedValue({
      accessToken: 'cached',
      expiresAtMs: Date.now() + 60 * 1000,
    });

    expect(await getTeamsConnectorToken(TEAMS_TEST_BOT_CREDENTIALS)).toBe(
      'minted',
    );
    expect(mintMock).toHaveBeenCalledWith(TEAMS_TEST_BOT_CREDENTIALS);
  });
});
