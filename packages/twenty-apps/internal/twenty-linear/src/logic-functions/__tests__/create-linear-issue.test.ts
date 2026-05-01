import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLinearIssueHandler } from '../handlers/create-linear-issue-handler';

const SAVED_ENV = { ...process.env };

const mockFetchOnce = (json: unknown, options: { ok?: boolean; status?: number } = {}) => {
  const responseBody = JSON.stringify(json);

  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: options.ok ?? true,
      status: options.status ?? 200,
      json: async () => json,
      text: async () => responseBody,
    })),
  );
};

const buildEvent = (body: object) => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/linear/create-issue' } },
});

describe('createLinearIssueHandler', () => {
  beforeEach(() => {
    process.env.OAUTH_LINEAR_CONNECTED = 'true';
    process.env.OAUTH_LINEAR_ACCESS_TOKEN = 'lin_test_access_token';
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

  it('returns an error when Linear is not connected', async () => {
    delete process.env.OAUTH_LINEAR_CONNECTED;
    delete process.env.OAUTH_LINEAR_ACCESS_TOKEN;

    const result = await createLinearIssueHandler(
      buildEvent({ teamId: 'team_1', title: 'hi' }),
    );

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('not connected'),
    });
  });

  it('calls Linear GraphQL with the bearer token and returns the issue', async () => {
    const issue = {
      id: 'issue_1',
      identifier: 'TEAM-1',
      title: 'Hello from Twenty',
      url: 'https://linear.app/twenty/issue/TEAM-1',
    };

    mockFetchOnce({
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

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];

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

  it('surfaces Linear GraphQL errors as the handler error', async () => {
    mockFetchOnce({
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
    mockFetchOnce({
      data: { issueCreate: { success: false, issue: null } },
    });

    const result = await createLinearIssueHandler(
      buildEvent({ teamId: 'team_1', title: 'hi' }),
    );

    expect(result.success).toBe(false);
  });
});
