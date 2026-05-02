import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listLinearTeamsHandler } from '../handlers/list-linear-teams-handler';

const SAVED_ENV = { ...process.env };

const USER_WORKSPACE_ID = '11111111-1111-1111-1111-111111111111';

const buildConnection = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'conn_1',
  name: 'octocat',
  scope: 'user' as const,
  providerName: 'linear',
  userWorkspaceId: USER_WORKSPACE_ID,
  accessToken: 'lin_test_access_token',
  scopes: ['read'],
  handle: 'octocat',
  lastRefreshedAt: '2024-01-01T00:00:00.000Z',
  authFailedAt: null,
  ...overrides,
});

const stubConnectionsThenLinear = (
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

const buildEvent = (
  userWorkspaceId: string | null = USER_WORKSPACE_ID,
) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body: null,
  isBase64Encoded: false,
  requestContext: { http: { method: 'GET', path: '/linear/teams' } },
  userWorkspaceId,
});

describe('listLinearTeamsHandler', () => {
  beforeEach(() => {
    process.env.TWENTY_API_URL = 'http://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
  });

  afterEach(() => {
    process.env = { ...SAVED_ENV };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns the teams when the Linear query succeeds', async () => {
    const teams = [
      { id: 'team_1', name: 'Engineering', key: 'ENG' },
      { id: 'team_2', name: 'Design', key: 'DES' },
    ];

    const fetchMock = stubConnectionsThenLinear([buildConnection()], {
      data: { teams: { nodes: teams } },
    });

    const result = await listLinearTeamsHandler(buildEvent());

    expect(result).toEqual({ success: true, teams });

    const [, init] = fetchMock.mock.calls[1];

    expect(init.headers.Authorization).toBe('Bearer lin_test_access_token');
  });

  it('returns success=false when there is no matching connection', async () => {
    stubConnectionsThenLinear([], { data: { teams: { nodes: [] } } });

    const result = await listLinearTeamsHandler(buildEvent());

    expect(result.success).toBe(false);
  });

  it('surfaces Linear errors', async () => {
    stubConnectionsThenLinear([buildConnection()], {
      errors: [{ message: 'rate limited' }],
    });

    const result = await listLinearTeamsHandler(buildEvent());

    expect(result).toEqual({ success: false, error: 'rate limited' });
  });
});
