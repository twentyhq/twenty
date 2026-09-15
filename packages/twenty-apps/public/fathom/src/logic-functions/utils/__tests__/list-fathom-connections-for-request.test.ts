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
  visibility: 'user',
  userWorkspaceId,
  accessToken: `token-${id}`,
});

const CONNECTIONS = [
  buildConnection('connection-1', 'user-workspace-1'),
  buildConnection('connection-2', 'user-workspace-2'),
];

describe('listFathomConnectionsForRequest', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    sdkMocks.listConnections.mockResolvedValue(CONNECTIONS);
  });

  it('returns every connected account for a run with nobody behind it', async () => {
    const sharedConnection = {
      ...buildConnection('connection-shared', 'user-workspace-1'),
      visibility: 'workspace',
    };

    sdkMocks.listConnections.mockResolvedValue([
      sharedConnection,
      ...CONNECTIONS,
    ]);

    expect(
      await listFathomConnectionsForRequest({ userWorkspaceId: null }),
    ).toEqual([sharedConnection, ...CONNECTIONS]);
  });
});
