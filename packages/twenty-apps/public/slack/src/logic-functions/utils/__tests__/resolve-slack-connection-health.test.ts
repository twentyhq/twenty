import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCurrentWorkspaceId } from 'src/logic-functions/utils/fetch-current-workspace-id';
import { findClaimedWorkspaceId } from 'src/logic-functions/utils/find-claimed-workspace-id';
import { resolveSlackConnectionHealth } from 'src/logic-functions/utils/resolve-slack-connection-health';

const { reportConnectionAuthFailureMock } = vi.hoisted(() => ({
  reportConnectionAuthFailureMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  reportConnectionAuthFailure: reportConnectionAuthFailureMock,
}));

vi.mock('src/logic-functions/utils/find-claimed-workspace-id', () => ({
  findClaimedWorkspaceId: vi.fn(),
}));

vi.mock('src/logic-functions/utils/fetch-current-workspace-id', () => ({
  fetchCurrentWorkspaceId: vi.fn(),
}));

const authTest = vi.fn();

const slackClient = { auth: { test: authTest } } as unknown as WebClient;

const CONNECTION_ID = 'connected-account-1';

const resolveHealth = () =>
  resolveSlackConnectionHealth({ slackClient, connectionId: CONNECTION_ID });

describe('resolveSlackConnectionHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authTest.mockResolvedValue({ ok: true, team_id: 'T1' });
    reportConnectionAuthFailureMock.mockResolvedValue(undefined);
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue('workspace-1');
    vi.mocked(fetchCurrentWorkspaceId).mockResolvedValue('workspace-1');
  });

  it('should report a healthy connection claimed by this workspace', async () => {
    await expect(resolveHealth()).resolves.toEqual({
      connectionHealth: 'ok',
      installedSlackTeamId: 'T1',
    });

    expect(reportConnectionAuthFailureMock).not.toHaveBeenCalled();
  });

  it('should report a rejected token', async () => {
    authTest.mockRejectedValue(
      Object.assign(new Error('An API error occurred: invalid_auth'), {
        data: { ok: false, error: 'invalid_auth' },
      }),
    );

    await expect(resolveHealth()).resolves.toEqual({
      connectionHealth: 'token_rejected',
      installedSlackTeamId: undefined,
    });
  });

  it('should flag the platform connection when the token is rejected', async () => {
    authTest.mockRejectedValue(
      Object.assign(new Error('An API error occurred: token_revoked'), {
        data: { ok: false, error: 'token_revoked' },
      }),
    );

    await resolveHealth();

    expect(reportConnectionAuthFailureMock).toHaveBeenCalledTimes(1);
    expect(reportConnectionAuthFailureMock).toHaveBeenCalledWith({
      connectionId: CONNECTION_ID,
      reason: expect.stringContaining('token_revoked'),
    });
  });

  it('should still report a rejected token when the platform report fails', async () => {
    authTest.mockRejectedValue(
      Object.assign(new Error('An API error occurred: invalid_auth'), {
        data: { ok: false, error: 'invalid_auth' },
      }),
    );
    reportConnectionAuthFailureMock.mockRejectedValue(
      new Error('platform unavailable'),
    );

    await expect(resolveHealth()).resolves.toEqual({
      connectionHealth: 'token_rejected',
      installedSlackTeamId: undefined,
    });

    expect(reportConnectionAuthFailureMock).toHaveBeenCalledTimes(1);
  });

  it('should not let a stalled platform report hold up the health result', async () => {
    vi.useFakeTimers();

    try {
      authTest.mockRejectedValue(
        Object.assign(new Error('An API error occurred: invalid_auth'), {
          data: { ok: false, error: 'invalid_auth' },
        }),
      );
      reportConnectionAuthFailureMock.mockReturnValue(
        new Promise(() => undefined),
      );

      const healthPromise = resolveHealth();

      await vi.advanceTimersByTimeAsync(5_000);

      await expect(healthPromise).resolves.toEqual({
        connectionHealth: 'token_rejected',
        installedSlackTeamId: undefined,
      });

      expect(reportConnectionAuthFailureMock).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should not raise an alarm on a transient auth.test failure', async () => {
    authTest.mockRejectedValue(new Error('socket hang up'));

    await expect(resolveHealth()).resolves.toEqual({
      connectionHealth: undefined,
      installedSlackTeamId: undefined,
    });

    expect(reportConnectionAuthFailureMock).not.toHaveBeenCalled();
  });

  it('should claim no health when auth.test returns no team id', async () => {
    authTest.mockResolvedValue({ ok: true });

    await expect(resolveHealth()).resolves.toEqual({
      connectionHealth: undefined,
      installedSlackTeamId: undefined,
    });
  });

  it('should report an unclaimed team', async () => {
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue(null);

    await expect(resolveHealth()).resolves.toEqual({
      connectionHealth: 'team_unclaimed',
      installedSlackTeamId: 'T1',
    });
  });

  it('should report a team claimed by another workspace', async () => {
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue('workspace-2');

    await expect(resolveHealth()).resolves.toEqual({
      connectionHealth: 'team_claimed_by_another_workspace',
      installedSlackTeamId: 'T1',
    });
  });

  it('should stay quiet when the claim lookup fails transiently', async () => {
    vi.mocked(findClaimedWorkspaceId).mockRejectedValue(
      new Error('kv unavailable'),
    );

    await expect(resolveHealth()).resolves.toEqual({
      connectionHealth: undefined,
      installedSlackTeamId: 'T1',
    });
  });

  it('should claim no health when the current workspace id is unknown', async () => {
    vi.mocked(fetchCurrentWorkspaceId).mockResolvedValue(undefined);
    vi.mocked(findClaimedWorkspaceId).mockResolvedValue('workspace-2');

    await expect(resolveHealth()).resolves.toEqual({
      connectionHealth: undefined,
      installedSlackTeamId: 'T1',
    });
  });
});
