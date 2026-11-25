import { listConnections } from 'twenty-sdk/logic-function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OTHER_CONNECTION,
  OWN_CONNECTION,
} from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { GRANOLA_PERSONAL_CONNECTIONS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { granolaPersonalConnectionsHandler } from 'src/logic-functions/granola-personal-connections';
import { loadGranolaPersonalFolders } from 'src/logic-functions/utils/load-granola-personal-folders.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  listConnections: vi.fn(),
}));

vi.mock('src/logic-functions/utils/load-granola-personal-folders.util', () => ({
  loadGranolaPersonalFolders: vi.fn(),
}));

const FIRST_CONNECTION_FOLDERS = {
  folders: [
    {
      id: 'fol_team',
      object: 'folder' as const,
      name: 'Team',
      parent_folder_id: null,
    },
  ],
  folderIds: ['fol_team'],
};

const requestConnections = () =>
  granolaPersonalConnectionsHandler(
    {
      body: null,
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      isBase64Encoded: false,
      requestContext: {
        http: {
          method: 'GET',
          path: GRANOLA_PERSONAL_CONNECTIONS_ROUTE_PATH,
        },
      },
      userWorkspaceId: OWN_CONNECTION.userWorkspaceId,
    },
    { userWorkspaceId: OWN_CONNECTION.userWorkspaceId },
  );

afterEach(() => {
  vi.resetAllMocks();
});

describe('granolaPersonalConnectionsHandler', () => {
  it("returns the requesting member's connections with the first connection's folders", async () => {
    vi.mocked(listConnections).mockResolvedValue([
      OWN_CONNECTION,
      OTHER_CONNECTION,
    ]);
    vi.mocked(loadGranolaPersonalFolders).mockResolvedValue(
      FIRST_CONNECTION_FOLDERS,
    );

    await expect(requestConnections()).resolves.toEqual({
      success: true,
      connections: [{ id: OWN_CONNECTION.id, name: OWN_CONNECTION.name }],
      firstConnectionFolders: FIRST_CONNECTION_FOLDERS,
    });
    expect(loadGranolaPersonalFolders).toHaveBeenCalledWith({
      connectionId: OWN_CONNECTION.id,
      userWorkspaceId: OWN_CONNECTION.userWorkspaceId,
    });
  });

  it('still returns the connections when Granola folders cannot be listed', async () => {
    vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(loadGranolaPersonalFolders).mockRejectedValue(
      new Error('Granola is temporarily unavailable'),
    );

    await expect(requestConnections()).resolves.toEqual({
      success: true,
      connections: [{ id: OWN_CONNECTION.id, name: OWN_CONNECTION.name }],
      firstConnectionFolders: null,
    });
  });

  it('skips Granola when the member has no connection', async () => {
    vi.mocked(listConnections).mockResolvedValue([OTHER_CONNECTION]);

    await expect(requestConnections()).resolves.toEqual({
      success: true,
      connections: [],
      firstConnectionFolders: null,
    });
    expect(loadGranolaPersonalFolders).not.toHaveBeenCalled();
  });
});
