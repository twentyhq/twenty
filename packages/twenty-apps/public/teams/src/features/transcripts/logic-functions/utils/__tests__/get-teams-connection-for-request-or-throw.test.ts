import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTeamsConnectionForRequestOrThrow } from 'src/features/transcripts/logic-functions/utils/get-teams-connection-for-request-or-throw';

const { listConnectionsMock } = vi.hoisted(() => ({
  listConnectionsMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  listConnections: listConnectionsMock,
}));

const buildConnection = ({
  id,
  visibility,
  userWorkspaceId,
}: {
  id: string;
  visibility: 'user' | 'workspace';
  userWorkspaceId: string;
}) => ({
  id,
  providerName: 'microsoft-teams',
  name: id,
  handle: `${id}@acme.com`,
  visibility,
  userWorkspaceId,
  workspaceMemberId: null,
  accessToken: 'token',
  scopes: [],
  authFailedAt: null,
  authFailedReason: null,
});

const SHARED_CONNECTION = buildConnection({
  id: 'shared-connection',
  visibility: 'workspace',
  userWorkspaceId: 'admin',
});

describe('getTeamsConnectionForRequestOrThrow', () => {
  beforeEach(() => {
    listConnectionsMock.mockResolvedValue([
      SHARED_CONNECTION,
      buildConnection({
        id: 'member-connection',
        visibility: 'user',
        userWorkspaceId: 'member',
      }),
    ]);
  });

  it('should fall back on the workspace-shared connection by default', async () => {
    await expect(
      getTeamsConnectionForRequestOrThrow({ userWorkspaceId: 'other-member' }),
    ).resolves.toMatchObject({ id: 'shared-connection' });
  });

  it.each([
    ['their personal connection', 'member', 'member-connection'],
    [
      'the workspace-shared connection they added',
      'admin',
      'shared-connection',
    ],
  ])(
    'should give a member who requires their own connection %s',
    async (_, userWorkspaceId, connectionId) => {
      await expect(
        getTeamsConnectionForRequestOrThrow(
          { userWorkspaceId },
          { isOwnConnectionRequired: true },
        ),
      ).resolves.toMatchObject({ id: connectionId });
    },
  );

  it.each([
    ['a member without a connection', 'other-member'],
    ['a request without a user', null],
  ])(
    'should not hand %s the workspace-shared connection when their own is required',
    async (_, userWorkspaceId) => {
      await expect(
        getTeamsConnectionForRequestOrThrow(
          { userWorkspaceId },
          { isOwnConnectionRequired: true },
        ),
      ).rejects.toMatchObject({ code: 'not-connected' });
    },
  );

  it('should ask to reconnect a connection whose authentication failed', async () => {
    listConnectionsMock.mockResolvedValue([
      { ...SHARED_CONNECTION, authFailedAt: '2026-09-15T00:00:00.000Z' },
    ]);

    await expect(
      getTeamsConnectionForRequestOrThrow({ userWorkspaceId: 'admin' }),
    ).rejects.toMatchObject({ code: 'reconnect-required' });
  });
});
