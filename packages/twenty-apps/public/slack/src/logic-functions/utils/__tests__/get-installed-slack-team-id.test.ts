import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_INSTALLED_TEAM_ID_KV_KEY } from 'src/logic-functions/constants/slack-installed-team-id-kv-key';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';

const { cacheSlackInstalledTeamIdMock, kvGetMock } = vi.hoisted(() => ({
  cacheSlackInstalledTeamIdMock: vi.fn(),
  kvGetMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock },
}));

vi.mock('src/logic-functions/utils/cache-slack-installed-team-id', () => ({
  cacheSlackInstalledTeamId: cacheSlackInstalledTeamIdMock,
}));

const TEAM_ID = 'T123';

const buildSlackClient = (authTestMock: ReturnType<typeof vi.fn>) =>
  ({ auth: { test: authTestMock } }) as unknown as WebClient;

describe('getInstalledSlackTeamId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cacheSlackInstalledTeamIdMock.mockResolvedValue(undefined);
  });

  it('should return the cached team id without calling Slack', async () => {
    kvGetMock.mockResolvedValue({
      installedTeamId: TEAM_ID,
      expiresAt: Date.now() + 1000,
    });
    const authTestMock = vi.fn();

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBe(TEAM_ID);
    expect(authTestMock).not.toHaveBeenCalled();
  });

  it('should ask Slack and cache the answer when nothing is cached', async () => {
    kvGetMock.mockResolvedValue(null);
    const authTestMock = vi.fn().mockResolvedValue({ team_id: TEAM_ID });

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBe(TEAM_ID);
    expect(authTestMock).toHaveBeenCalledTimes(1);
    expect(cacheSlackInstalledTeamIdMock).toHaveBeenCalledWith(TEAM_ID);
  });

  it('should ask Slack again once the cached entry has expired', async () => {
    kvGetMock.mockResolvedValue({
      installedTeamId: 'TOLD',
      expiresAt: Date.now() - 1000,
    });
    const authTestMock = vi.fn().mockResolvedValue({ team_id: TEAM_ID });

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBe(TEAM_ID);
    expect(authTestMock).toHaveBeenCalledTimes(1);
  });

  it('should fall back to Slack when the cache read fails', async () => {
    kvGetMock.mockRejectedValue(new Error('kv unavailable'));
    const authTestMock = vi.fn().mockResolvedValue({ team_id: TEAM_ID });

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBe(TEAM_ID);
    expect(kvGetMock).toHaveBeenCalledWith(SLACK_INSTALLED_TEAM_ID_KV_KEY);
  });

  it('should not cache anything when Slack returns no team id', async () => {
    kvGetMock.mockResolvedValue(null);
    const authTestMock = vi.fn().mockResolvedValue({});

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBeUndefined();
    expect(cacheSlackInstalledTeamIdMock).not.toHaveBeenCalled();
  });

  it('should return undefined without throwing when Slack rejects', async () => {
    kvGetMock.mockResolvedValue(null);
    const authTestMock = vi.fn().mockRejectedValue(new Error('invalid_auth'));

    const result = await getInstalledSlackTeamId(
      buildSlackClient(authTestMock),
    );

    expect(result).toBeUndefined();
    expect(cacheSlackInstalledTeamIdMock).not.toHaveBeenCalled();
  });
});
