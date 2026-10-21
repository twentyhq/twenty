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
    process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'true';
    listConnectionsMock.mockResolvedValue([]);
  });

  afterEach(() => {
    delete process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY];
  });

  it('should report a missing connection with a button to the connections', async () => {
    await expect(teamsHealthCheckHandler()).resolves.toEqual({
      status: 'WARNING',
      title: 'Microsoft Teams is not connected',
      description: expect.stringContaining('No Microsoft Teams account'),
      action: { label: 'Add connection', location: '#general' },
    });

    expect(listConnectionsMock).toHaveBeenCalledWith({
      providerName: 'microsoft-teams',
    });
  });

  it('should report nothing once a connection exists', async () => {
    listConnectionsMock.mockResolvedValue([{ id: 'connection-1' }]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });
  });

  it('should report nothing when no feature needs a connection', async () => {
    process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY] = 'false';

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });

    expect(listConnectionsMock).not.toHaveBeenCalled();
  });
});
