import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listFathomConnectionsForRequest } from 'src/logic-functions/utils/list-fathom-connections-for-request.util';

const sdkMocks = vi.hoisted(() => ({
  listConnections: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  listConnections: sdkMocks.listConnections,
}));

const buildConnection = (id: string, userWorkspaceId: string) => ({
  id,
  providerName: 'fathom-user',
  scope: 'USER',
  userWorkspaceId,
  accessToken: `token-${id}`,
});

const SHARED_CONNECTION = {
  ...buildConnection('connection-shared', 'user-workspace-1'),
  providerName: 'fathom',
  scope: 'WORKSPACE',
};

const CONNECTIONS = [
  buildConnection('connection-1', 'user-workspace-1'),
  buildConnection('connection-2', 'user-workspace-2'),
];

describe('listFathomConnectionsForRequest', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sdkMocks.listConnections.mockResolvedValue([
      SHARED_CONNECTION,
      ...CONNECTIONS,
    ]);
  });

  it('returns every connected account for a run with nobody behind it', async () => {
    expect(
      await listFathomConnectionsForRequest({ userWorkspaceId: null }),
    ).toEqual([SHARED_CONNECTION, ...CONNECTIONS]);
  });

  it('returns only the personal connection of the requesting member', async () => {
    expect(
      await listFathomConnectionsForRequest({
        userWorkspaceId: 'user-workspace-2',
      }),
    ).toEqual([CONNECTIONS[1]]);
  });

  it('falls back to the workspace-shared connection for a member without one', async () => {
    expect(
      await listFathomConnectionsForRequest({
        userWorkspaceId: 'user-workspace-3',
      }),
    ).toEqual([SHARED_CONNECTION]);
  });

  it('ignores connections of other providers', async () => {
    sdkMocks.listConnections.mockResolvedValue([
      { ...SHARED_CONNECTION, providerName: 'other-provider' },
    ]);

    expect(
      await listFathomConnectionsForRequest({ userWorkspaceId: null }),
    ).toEqual([]);
  });
});
