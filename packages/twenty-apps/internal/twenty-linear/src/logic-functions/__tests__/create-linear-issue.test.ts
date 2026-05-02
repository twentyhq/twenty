import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLinearIssueHandler } from '../handlers/create-linear-issue-handler';

const SAVED_ENV = { ...process.env };

const USER_WORKSPACE_ID = '11111111-1111-1111-1111-111111111111';

const buildConnection = (overrides: Partial<Record<string, unknown>> = {}) => ({
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

const stubConnectionsThenLinear = (
  connections: ReturnType<typeof buildConnection>[],
  linearJson: unknown,
  linearOptions: { ok?: boolean; status?: number } = {},
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
      ok: linearOptions.ok ?? true,
      status: linearOptions.status ?? 200,
      json: async () => linearJson,
      text: async () => JSON.stringify(linearJson),
    };
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

const buildEvent = (
  body: object,
  userWorkspaceId: string | null = USER_WORKSPACE_ID,
) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/linear/create-issue' } },
  userWorkspaceId,
});

describe('createLinearIssueHandler', () => {
  beforeEach(() => {
    process.env.TWENTY_API_URL = 'http://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
  });

  afterEach(() => {
    process.env = { ...SAVED_ENV };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns an error when the body is missing required fields', async () => {
    const result = await createLinearIssueHandler(
      buildEvent({ title: 'no team' }),
    );

    expect(result.success).toBe(false);
    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('teamId'),
    });
  });

  it('returns an error when no connection matches the request user', async () => {
    stubConnectionsThenLinear([], {});

    const result = await createLinearIssueHandler(
      buildEvent({ teamId: 'team_1', title: 'hi' }),
    );

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('not connected'),
    });
  });

  it('calls Linear with the matching user connection and returns the issue', async () => {
    const issue = {
      id: 'issue_1',
      identifier: 'TEAM-1',
      title: 'Hello from Twenty',
      url: 'https://linear.app/twenty/issue/TEAM-1',
    };

    const fetchMock = stubConnectionsThenLinear([buildConnection()], {
      data: { issueCreate: { success: true, issue } },
    });

    const result = await createLinearIssueHandler(
      buildEvent({
        teamId: 'team_1',
        title: 'Hello from Twenty',
        description: 'Body',
      }),
    );

    expect(result).toEqual({ success: true, issue });

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const linearCall = fetchMock.mock.calls[1];
    const [url, init] = linearCall;

    expect(url).toBe('https://api.linear.app/graphql');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer lin_test_access_token');
    expect(init.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(init.body as string);

    expect(body.variables.input).toEqual({
      teamId: 'team_1',
      title: 'Hello from Twenty',
      description: 'Body',
    });
  });

  it('falls back to a workspace-shared connection when the user has none', async () => {
    const sharedConnection = buildConnection({
      id: 'conn_shared',
      scope: 'workspace',
      userWorkspaceId: '99999999-9999-9999-9999-999999999999',
      accessToken: 'lin_shared',
    });

    const fetchMock = stubConnectionsThenLinear([sharedConnection], {
      data: {
        issueCreate: {
          success: true,
          issue: {
            id: 'issue_2',
            identifier: 'T-2',
            title: 'Hi',
            url: 'https://linear.app/x/T-2',
          },
        },
      },
    });

    const result = await createLinearIssueHandler(
      buildEvent({ teamId: 'team_1', title: 'Hi' }),
    );

    expect(result.success).toBe(true);

    const [, init] = fetchMock.mock.calls[1];

    expect(init.headers.Authorization).toBe('Bearer lin_shared');
  });

  it('surfaces Linear GraphQL errors as the handler error', async () => {
    stubConnectionsThenLinear([buildConnection()], {
      errors: [{ message: 'Invalid teamId' }],
    });

    const result = await createLinearIssueHandler(
      buildEvent({ teamId: 'bogus', title: 'hi' }),
    );

    expect(result).toEqual({
      success: false,
      error: 'Invalid teamId',
    });
  });

  it('surfaces success=false from issueCreate as a handler error', async () => {
    stubConnectionsThenLinear([buildConnection()], {
      data: { issueCreate: { success: false, issue: null } },
    });

    const result = await createLinearIssueHandler(
      buildEvent({ teamId: 'team_1', title: 'hi' }),
    );

    expect(result.success).toBe(false);
  });
});
