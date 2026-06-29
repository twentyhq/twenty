import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLinearIssueHandler } from '../handlers/create-linear-issue-handler';

import { buildConnection, stubConnectionsThenLinear } from './test-utils';

const SAVED_ENV = { ...process.env };

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

  it('returns an error when required input fields are missing', async () => {
    const result = await createLinearIssueHandler({ title: 'no team' });

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('teamId'),
    });
  });

  it('returns an error when no Linear connection exists', async () => {
    stubConnectionsThenLinear([], {});

    const result = await createLinearIssueHandler({
      teamId: 'team_1',
      title: 'hi',
    });

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('not connected'),
    });
  });

  it('calls Linear with the only available connection and returns the issue', async () => {
    const issue = {
      id: 'issue_1',
      identifier: 'TEAM-1',
      title: 'Hello from Twenty',
      url: 'https://linear.app/twenty/issue/TEAM-1',
    };

    const fetchMock = stubConnectionsThenLinear([buildConnection()], {
      data: { issueCreate: { success: true, issue } },
    });

    const result = await createLinearIssueHandler({
      teamId: 'team_1',
      title: 'Hello from Twenty',
      description: 'Body',
    });

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

  it('prefers a workspace-shared connection over a user-visibility one', async () => {
    const userConnection = buildConnection({
      id: 'conn_user',
      accessToken: 'lin_user',
    });
    const sharedConnection = buildConnection({
      id: 'conn_shared',
      visibility: 'workspace',
      accessToken: 'lin_shared',
    });

    const fetchMock = stubConnectionsThenLinear(
      [userConnection, sharedConnection],
      {
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
      },
    );

    const result = await createLinearIssueHandler({
      teamId: 'team_1',
      title: 'Hi',
    });

    expect(result.success).toBe(true);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe(
      'Bearer lin_shared',
    );
  });

  it('surfaces Linear GraphQL errors as the handler error', async () => {
    stubConnectionsThenLinear([buildConnection()], {
      errors: [{ message: 'Invalid teamId' }],
    });

    const result = await createLinearIssueHandler({
      teamId: 'bogus',
      title: 'hi',
    });

    expect(result).toEqual({ success: false, error: 'Invalid teamId' });
  });
});
