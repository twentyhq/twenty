import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createWorkspaceMemberCoreApiClient } from 'src/logic-functions/utils/create-workspace-member-core-api-client';

const { coreApiClientMock, restApiClientMock, restPostMock } = vi.hoisted(
  () => ({
    coreApiClientMock: vi.fn(),
    restApiClientMock: vi.fn(),
    restPostMock: vi.fn(),
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: restApiClientMock,
}));

const WORKSPACE_MEMBER_ID = '20202020-0687-4c41-b707-ed1bfca972a7';

describe('createWorkspaceMemberCoreApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    restApiClientMock.mockImplementation(function () {
      return { post: restPostMock };
    });
    coreApiClientMock.mockImplementation(function () {
      return { member: true };
    });
  });

  it('should exchange the application token for the member and build a client on it', async () => {
    restPostMock.mockResolvedValue({
      data: {
        generateApplicationTokenForWorkspaceMember: { token: 'member-token' },
      },
    });

    const client = await createWorkspaceMemberCoreApiClient({
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });

    expect(client).toEqual({ member: true });
    expect(restApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(restPostMock).toHaveBeenCalledWith('/metadata', {
      query: expect.stringContaining(
        'generateApplicationTokenForWorkspaceMember',
      ),
      variables: { workspaceMemberId: WORKSPACE_MEMBER_ID },
    });
    expect(coreApiClientMock).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer member-token' },
    });
  });

  it('should not build a client when the server refuses the member', async () => {
    restPostMock.mockResolvedValue({
      errors: [{ message: 'Workspace member not found' }],
    });

    await expect(
      createWorkspaceMemberCoreApiClient({
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).resolves.toBeUndefined();

    expect(coreApiClientMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Workspace member not found'),
    );
  });

  it('should not build a client when the exchange request fails', async () => {
    restPostMock.mockRejectedValue(new Error('network down'));

    await expect(
      createWorkspaceMemberCoreApiClient({
        workspaceMemberId: WORKSPACE_MEMBER_ID,
      }),
    ).resolves.toBeUndefined();

    expect(coreApiClientMock).not.toHaveBeenCalled();
  });
});
