import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TEAMS_CONNECTOR_TOKEN_KV_KEY } from 'src/logic-functions/constants/teams-connector-token-kv-key';
import { getTeamsConnectorToken } from 'src/logic-functions/utils/get-teams-connector-token';

const CREDENTIALS = {
  appId: 'bbbbbbbb-1111-2222-3333-444444444444',
  appPassword: 'client-secret',
  tenantId: 'cccccccc-1111-2222-3333-444444444444',
};

const { kvGetMock, kvSetMock, mintMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
  mintMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock },
}));

vi.mock('src/logic-functions/utils/mint-teams-connector-token', () => ({
  mintTeamsConnectorToken: mintMock,
}));

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

    expect(await getTeamsConnectorToken(CREDENTIALS)).toBe('cached');
    expect(mintMock).not.toHaveBeenCalled();
  });

  it('should mint and cache at workspace scope when nothing is stored', async () => {
    kvGetMock.mockResolvedValue(null);

    expect(await getTeamsConnectorToken(CREDENTIALS)).toBe('minted');
    expect(kvGetMock).toHaveBeenCalledWith(TEAMS_CONNECTOR_TOKEN_KV_KEY);
    expect(kvSetMock).toHaveBeenCalledWith(TEAMS_CONNECTOR_TOKEN_KV_KEY, {
      accessToken: 'minted',
      expiresAtMs: Date.now() + 3600 * 1000,
    });
  });

  it('should refresh a token that expires inside the refresh margin', async () => {
    kvGetMock.mockResolvedValue({
      accessToken: 'cached',
      expiresAtMs: Date.now() + 60 * 1000,
    });

    expect(await getTeamsConnectorToken(CREDENTIALS)).toBe('minted');
    expect(mintMock).toHaveBeenCalledWith(CREDENTIALS);
  });
});
