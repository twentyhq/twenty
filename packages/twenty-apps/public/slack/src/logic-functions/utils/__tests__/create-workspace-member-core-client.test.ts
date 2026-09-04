import { afterEach, describe, expect, it, vi } from 'vitest';

import { createWorkspaceMemberCoreClient } from 'src/logic-functions/utils/create-workspace-member-core-client';

const postMock = vi.hoisted(() => vi.fn());
const restApiClientOptionsMock = vi.hoisted(() => vi.fn());
const coreApiClientOptionsMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: class {
    constructor(options?: unknown) {
      restApiClientOptionsMock(options);
    }
    post = postMock;
  },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    constructor(options?: unknown) {
      coreApiClientOptionsMock(options);
    }
  },
}));

const WORKSPACE_MEMBER_ID = '20202020-0000-0000-0000-000000000001';

describe('createWorkspaceMemberCoreClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should build a client authorized as the workspace member', async () => {
    postMock.mockResolvedValue({ token: 'member-token' });

    const client = await createWorkspaceMemberCoreClient(WORKSPACE_MEMBER_ID);

    expect(client).toBeDefined();
    expect(restApiClientOptionsMock).toHaveBeenCalledWith({
      runAs: 'application',
    });
    expect(postMock).toHaveBeenCalledWith(
      '/app/tokens/run-as-workspace-member',
      { workspaceMemberId: WORKSPACE_MEMBER_ID },
      expect.objectContaining({ signal: expect.anything() }),
    );
    expect(coreApiClientOptionsMock).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer member-token' },
    });
  });

  it('should return undefined when the response carries no token', async () => {
    postMock.mockResolvedValue({});

    expect(
      await createWorkspaceMemberCoreClient(WORKSPACE_MEMBER_ID),
    ).toBeUndefined();
    expect(coreApiClientOptionsMock).not.toHaveBeenCalled();
  });

  it('should return undefined when the exchange fails', async () => {
    postMock.mockRejectedValue(new Error('403 Forbidden'));

    expect(
      await createWorkspaceMemberCoreClient(WORKSPACE_MEMBER_ID),
    ).toBeUndefined();
    expect(coreApiClientOptionsMock).not.toHaveBeenCalled();
  });
});
