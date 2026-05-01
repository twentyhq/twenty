import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listLinearTeamsHandler } from '../handlers/list-linear-teams-handler';

const SAVED_ENV = { ...process.env };

const stubFetch = (json: unknown) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => json,
      text: async () => JSON.stringify(json),
    })),
  );

describe('listLinearTeamsHandler', () => {
  beforeEach(() => {
    process.env.OAUTH_LINEAR_CONNECTED = 'true';
    process.env.OAUTH_LINEAR_ACCESS_TOKEN = 'lin_test_access_token';
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

    stubFetch({ data: { teams: { nodes: teams } } });

    const result = await listLinearTeamsHandler();

    expect(result).toEqual({ success: true, teams });

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];

    expect(init.headers.Authorization).toBe('Bearer lin_test_access_token');
  });

  it('returns success=false when the user is not connected', async () => {
    delete process.env.OAUTH_LINEAR_CONNECTED;
    delete process.env.OAUTH_LINEAR_ACCESS_TOKEN;

    const result = await listLinearTeamsHandler();

    expect(result.success).toBe(false);
  });

  it('surfaces Linear errors', async () => {
    stubFetch({ errors: [{ message: 'rate limited' }] });

    const result = await listLinearTeamsHandler();

    expect(result).toEqual({ success: false, error: 'rate limited' });
  });
});
