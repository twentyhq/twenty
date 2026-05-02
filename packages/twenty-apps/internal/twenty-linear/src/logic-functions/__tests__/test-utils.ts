import { vi } from 'vitest';

export const USER_WORKSPACE_ID = '11111111-1111-1111-1111-111111111111';

export const buildConnection = (
  overrides: Partial<Record<string, unknown>> = {},
) => ({
  id: 'conn_1',
  name: 'octocat@example.com',
  scope: 'user' as const,
  providerName: 'linear',
  userWorkspaceId: USER_WORKSPACE_ID,
  accessToken: 'lin_test_access_token',
  scopes: ['read', 'write'],
  handle: 'octocat@example.com',
  lastRefreshedAt: '2024-01-01T00:00:00.000Z',
  authFailedAt: null,
  ...overrides,
});

// Stubs `fetch` to first answer the SDK's `/apps/connections/list` call, then
// the handler's downstream Linear GraphQL request.
export const stubConnectionsThenLinear = (
  connections: ReturnType<typeof buildConnection>[],
  linearJson: unknown,
) => {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.endsWith('/apps/connections/list')) {
      return {
        ok: true,
        status: 200,
        json: async () => connections,
        text: async () => JSON.stringify(connections),
      };
    }

    return {
      ok: true,
      status: 200,
      json: async () => linearJson,
      text: async () => JSON.stringify(linearJson),
    };
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

export const buildEvent = <TBody = object>(
  body: TBody | null,
  path: string,
  method: string,
  userWorkspaceId: string | null = USER_WORKSPACE_ID,
) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method, path } },
  userWorkspaceId,
});
