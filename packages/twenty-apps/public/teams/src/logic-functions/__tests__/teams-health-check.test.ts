import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/chat/constants/chat-enabled-application-variable-key';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { teamsHealthCheckHandler } from 'src/logic-functions/teams-health-check';

const { listTeamsConnectionsMock, releaseFlags } = vi.hoisted(() => ({
  listTeamsConnectionsMock: vi.fn(),
  releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: false },
}));

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock(
  'src/features/transcripts/logic-functions/utils/list-teams-connections',
  () => ({ listTeamsConnections: listTeamsConnectionsMock }),
);

const PERSONAL_CONNECTION = {
  id: 'personal-connection',
  scope: 'USER',
  authFailedAt: null,
};

const WORKSPACE_CONNECTION = {
  id: 'workspace-connection',
  scope: 'WORKSPACE',
  authFailedAt: null,
};

const enableChat = () => {
  releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
  vi.stubEnv(CHAT_ENABLED_APPLICATION_VARIABLE_KEY, 'true');
};

describe('teamsHealthCheckHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = false;
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'true');
    listTeamsConnectionsMock.mockResolvedValue([]);
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
  });

  it('should report nothing once a working connection exists', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      { id: 'connection-1', authFailedAt: '2026-10-01T00:00:00.000Z' },
      { id: 'connection-2', authFailedAt: null },
    ]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });
  });

  it('should let personal connections alone satisfy transcript imports', async () => {
    listTeamsConnectionsMock.mockResolvedValue([PERSONAL_CONNECTION]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });
  });

  it('should ask to reconnect when every connection was rejected', async () => {
    listTeamsConnectionsMock.mockResolvedValue([
      { id: 'connection-1', authFailedAt: '2026-10-01T00:00:00.000Z' },
    ]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({
      status: 'ERROR',
      title: 'Microsoft Teams connection needs to be reconnected',
      description: expect.stringContaining('Microsoft rejected the stored'),
      action: { label: 'Manage connection', location: '#general' },
    });
  });

  it('should ask for a workspace connection when chat only has personal ones', async () => {
    enableChat();
    listTeamsConnectionsMock.mockResolvedValue([PERSONAL_CONNECTION]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({
      status: 'WARNING',
      title: 'Microsoft Teams chat needs a workspace connection',
      description: expect.stringContaining('personal connections do not count'),
      action: { label: 'Add connection', location: '#general' },
    });
  });

  it('should report nothing for chat once a workspace connection works', async () => {
    enableChat();
    listTeamsConnectionsMock.mockResolvedValue([
      PERSONAL_CONNECTION,
      WORKSPACE_CONNECTION,
    ]);

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });
  });

  it('should report nothing when no feature needs a connection', async () => {
    vi.stubEnv(TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY, 'false');

    await expect(teamsHealthCheckHandler()).resolves.toEqual({ status: 'OK' });

    expect(listTeamsConnectionsMock).not.toHaveBeenCalled();
  });
});
