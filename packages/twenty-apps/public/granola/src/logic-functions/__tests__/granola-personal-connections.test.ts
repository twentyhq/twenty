import { listConnections } from 'twenty-sdk/logic-function';
import { describe, expect, it, vi } from 'vitest';

import {
  OTHER_CONNECTION,
  OWN_CONNECTION,
} from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { GRANOLA_PERSONAL_CONNECTIONS_ROUTE_PATH } from 'src/constants/granola-personal-connection.constant';
import { granolaPersonalConnectionsHandler } from 'src/logic-functions/granola-personal-connections';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  listConnections: vi.fn(),
}));

describe('granolaPersonalConnectionsHandler', () => {
  it('returns connection labels only for the requesting member', async () => {
    vi.mocked(listConnections).mockResolvedValue([
      OWN_CONNECTION,
      OTHER_CONNECTION,
    ]);

    await expect(
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
      ),
    ).resolves.toEqual({
      success: true,
      connections: [{ id: OWN_CONNECTION.id, name: OWN_CONNECTION.name }],
    });
  });
});
