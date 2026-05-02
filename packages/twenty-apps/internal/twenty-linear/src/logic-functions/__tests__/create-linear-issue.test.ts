import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLinearIssueHandler } from '../handlers/create-linear-issue-handler';

import {
  buildConnection,
  buildEvent,
  stubConnectionsThenLinear,
} from './test-utils';

const SAVED_ENV = { ...process.env };

const buildIssueEvent = (body: object) =>
  buildEvent(body, '/linear/create-issue', 'POST');

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
      buildIssueEvent({ title: 'no team' }),
    );

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('teamId'),
    });
  });

  it('returns an error when no connection matches the request user', async () => {
    stubConnectionsThenLinear([], {});

    const result = await createLinearIssueHandler(
      buildIssueEvent({ teamId: 'team_1', title: 'hi' }),
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
      buildIssueEvent({
        teamId: 'team_1',
        title: 'Hello from Twenty',
        description: 'Body',
      }),
    );

    expect(result).toEqual({ success: true, issue });

    const [url, init] = fetchMock.mock.calls[1];

    expect(url).toBe('https://api.linear.app/graphql');
    expect(init.headers.Authorization).toBe('Bearer lin_test_access_token');
    expect(JSON.parse(init.body as string).variables.input).toEqual({
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
      buildIssueEvent({ teamId: 'team_1', title: 'Hi' }),
    );

    expect(result.success).toBe(true);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe(
      'Bearer lin_shared',
    );
  });

  it('surfaces Linear GraphQL errors as the handler error', async () => {
    stubConnectionsThenLinear([buildConnection()], {
      errors: [{ message: 'Invalid teamId' }],
    });

    const result = await createLinearIssueHandler(
      buildIssueEvent({ teamId: 'bogus', title: 'hi' }),
    );

    expect(result).toEqual({ success: false, error: 'Invalid teamId' });
  });
});
