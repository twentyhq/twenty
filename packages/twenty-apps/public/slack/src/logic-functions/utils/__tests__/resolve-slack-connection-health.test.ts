import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCurrentWorkspaceId } from 'src/logic-functions/utils/fetch-current-workspace-id';
import { findClaimedWorkspaceId } from 'src/logic-functions/utils/find-claimed-workspace-id';
import { resolveSlackConnectionHealth } from 'src/logic-functions/utils/resolve-slack-connection-health';

vi.mock('src/logic-functions/utils/find-claimed-workspace-id', () => ({
  findClaimedWorkspaceId: vi.fn(),
}));

vi.mock('src/logic-functions/utils/fetch-current-workspace-id', () => ({
  fetchCurrentWorkspaceId: vi.fn(),
}));

const authTest = vi.fn();

const slackClient = { auth: { test: authTest } } as unknown as WebClient;

describe('resolveSlackConnectionHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authTest.mockResolvedValue({ ok: true, team_id: 'T1' });
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue('workspace-1');
    vi.mocked(fetchCurrentWorkspaceId).mockResolvedValue('workspace-1');
  });

  it('should report a healthy connection claimed by this workspace', async () => {
    await expect(resolveSlackConnectionHealth(slackClient)).resolves.toEqual({
      connectionHealth: 'ok',
      installedSlackTeamId: 'T1',
    });
  });

  it('should report a rejected token', async () => {
    authTest.mockRejectedValue(
      Object.assign(new Error('An API error occurred: invalid_auth'), {
        data: { ok: false, error: 'invalid_auth' },
      }),
    );

    await expect(resolveSlackConnectionHealth(slackClient)).resolves.toEqual({
      connectionHealth: 'token_rejected',
      installedSlackTeamId: undefined,
    });
  });

  it('should not raise an alarm on a transient auth.test failure', async () => {
    authTest.mockRejectedValue(new Error('socket hang up'));

    await expect(resolveSlackConnectionHealth(slackClient)).resolves.toEqual({
      connectionHealth: undefined,
      installedSlackTeamId: undefined,
    });
  });

  it('should claim no health when auth.test returns no team id', async () => {
    authTest.mockResolvedValue({ ok: true });

    await expect(resolveSlackConnectionHealth(slackClient)).resolves.toEqual({
      connectionHealth: undefined,
      installedSlackTeamId: undefined,
    });
  });

  it('should report an unclaimed team', async () => {
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue(null);

    await expect(resolveSlackConnectionHealth(slackClient)).resolves.toEqual({
      connectionHealth: 'team_unclaimed',
      installedSlackTeamId: 'T1',
    });
  });

  it('should report a team claimed by another workspace', async () => {
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue('workspace-2');

    await expect(resolveSlackConnectionHealth(slackClient)).resolves.toEqual({
      connectionHealth: 'team_claimed_by_another_workspace',
      installedSlackTeamId: 'T1',
    });
  });

  it('should stay quiet when the claim lookup fails transiently', async () => {
    vi.mocked(findClaimedWorkspaceId).mockRejectedValue(
      new Error('kv unavailable'),
    );

    await expect(resolveSlackConnectionHealth(slackClient)).resolves.toEqual({
      connectionHealth: undefined,
      installedSlackTeamId: 'T1',
    });
  });

  it('should claim no health when the current workspace id is unknown', async () => {
    vi.mocked(fetchCurrentWorkspaceId).mockResolvedValue(undefined);
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue('workspace-2');

    await expect(resolveSlackConnectionHealth(slackClient)).resolves.toEqual({
      connectionHealth: undefined,
      installedSlackTeamId: 'T1',
    });
  });
});
