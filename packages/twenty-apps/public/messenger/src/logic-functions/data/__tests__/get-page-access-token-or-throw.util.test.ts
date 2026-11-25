import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPageAccessTokenOrThrow } from 'src/logic-functions/data/get-page-access-token-or-throw.util';
import { GraphApiError } from 'src/logic-functions/data/graph-api.error';

const { graphApiRequest } = vi.hoisted(() => ({ graphApiRequest: vi.fn() }));

vi.mock('src/logic-functions/data/graph-api-request.util', () => ({
  graphApiRequest,
}));
vi.mock(
  'src/logic-functions/data/get-messenger-access-token-or-throw.util',
  () => ({
    getMessengerAccessTokenOrThrow: async () => 'system-user-token',
  }),
);
vi.mock(
  'src/logic-functions/data/with-connection-auth-failure-report.util',
  () => ({
    withConnectionAuthFailureReport: (
      _connectedAccountId: string,
      request: () => Promise<unknown>,
    ) => request(),
  }),
);

const getToken = () =>
  getPageAccessTokenOrThrow({
    connectedAccountId: 'connection-1',
    pageId: 'page-1',
  });

describe('getPageAccessTokenOrThrow', () => {
  beforeEach(() => {
    graphApiRequest.mockReset();
  });

  it('fetches the token of the one Page', async () => {
    graphApiRequest.mockResolvedValue({ access_token: 'page-token' });

    expect(await getToken()).toBe('page-token');
    expect(graphApiRequest).toHaveBeenCalledWith({
      accessToken: 'system-user-token',
      method: 'GET',
      path: 'page-1',
      query: { fields: 'access_token' },
    });
  });

  it('explains a Page the connection can no longer see', async () => {
    graphApiRequest.mockRejectedValue(
      new GraphApiError('Messenger API error 100: does not exist', 100),
    );

    await expect(getToken()).rejects.toThrow(
      'The Messenger connection no longer has access to Page page-1',
    );
  });

  it('explains a Page whose token the connection cannot get', async () => {
    graphApiRequest.mockResolvedValue({ id: 'page-1' });

    await expect(getToken()).rejects.toThrow(
      'The Messenger connection no longer has access to Page page-1',
    );
  });

  it('keeps other Graph API errors', async () => {
    graphApiRequest.mockRejectedValue(
      new GraphApiError('Messenger API error 4: rate limit', 4),
    );

    await expect(getToken()).rejects.toThrow('rate limit');
  });
});
