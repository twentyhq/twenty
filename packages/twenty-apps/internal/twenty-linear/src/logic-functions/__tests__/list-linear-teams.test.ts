import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listLinearTeamsHandler } from '../handlers/list-linear-teams-handler';

import {
  buildConnection,
  buildEvent,
  stubConnectionsThenLinear,
} from './test-utils';

const SAVED_ENV = { ...process.env };

const teamsEvent = () => buildEvent(null, '/linear/teams', 'GET');

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

    const result = await listLinearTeamsHandler(teamsEvent());

    expect(result).toEqual({ success: true, teams });
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe(
      'Bearer lin_test_access_token',
    );
  });

  it('returns success=false when there is no matching connection', async () => {
    stubConnectionsThenLinear([], { data: { teams: { nodes: [] } } });

    const result = await listLinearTeamsHandler(teamsEvent());

    expect(result.success).toBe(false);
  });

  it('surfaces Linear errors', async () => {
    stubConnectionsThenLinear([buildConnection()], {
      errors: [{ message: 'rate limited' }],
    });

    const result = await listLinearTeamsHandler(teamsEvent());

    expect(result).toEqual({ success: false, error: 'rate limited' });
  });
});
