import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { teamsHealthCheckHandler } from 'src/logic-functions/teams-health-check';

const { listConnectionsMock } = vi.hoisted(() => ({
  listConnectionsMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  listConnections: listConnectionsMock,
}));

describe('teamsHealthCheckHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'true');
    listConnectionsMock.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should report a missing connection with a button to the connections', async () => {
    await expect(teamsHealthCheckHandler()).resolves.toEqual({
      status: 'WARNING',
      title: 'Microsoft Teams is not connected',
      description: expect.stringContaining('No working Microsoft Teams'),
      action: { label: 'Add connection', location: '#general' },
    });

    expect(listConnectionsMock).toHaveBeenCalledWith({
      providerName: 'microsoft-teams',
    });
  });

  it('should report nothing once a working connection exists', async () => {
    listConnectionsMock.mockResolvedValue([
      { id: 'connection-1', authFailedAt: '2026-10-01T00:00:00.000Z' },
      { id: 'connection-2', authFailedAt: null },
    ]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });
  });

  it('should ask to reconnect when every connection was rejected', async () => {
    listConnectionsMock.mockResolvedValue([
      { id: 'connection-1', authFailedAt: '2026-10-01T00:00:00.000Z' },
    ]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({
      status: 'ERROR',
      title: 'Microsoft Teams connection needs to be reconnected',
      description: expect.stringContaining('Microsoft rejected the stored'),
      action: { label: 'Manage connection', location: '#general' },
    });
  });

  it('should report nothing when no feature needs a connection', async () => {
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'false');

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });

    expect(listConnectionsMock).not.toHaveBeenCalled();
  });
});
