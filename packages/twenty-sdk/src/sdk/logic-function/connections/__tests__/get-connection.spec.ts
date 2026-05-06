import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { AppConnectionAuthFailedError } from '@/sdk/logic-function/connections/errors/app-connection-auth-failed.error';
import { getConnection } from '@/sdk/logic-function/connections/get-connection';
import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

const buildConnection = (
  overrides: Partial<AppConnection> = {},
): AppConnection => ({
  id: 'c-1',
  providerName: 'linear',
  name: 'Linear #1',
  handle: 'octocat@example.com',
  visibility: 'user',
  userWorkspaceId: 'uws-me',
  accessToken: 'fresh',
  scopes: ['read'],
  authFailedAt: null,
  ...overrides,
});

describe('getConnection', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('POSTs the id to /apps/connections/get and returns the response', async () => {
    const connection = buildConnection({ id: 'persisted' });

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(connection), { status: 200 }),
    );

    const result = await getConnection('persisted');

    expect(result).toEqual(connection);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.test/apps/connections/get',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ id: 'persisted' }),
        headers: expect.objectContaining({
          Authorization: 'Bearer app-token',
        }),
      }),
    );
  });

  it('throws AppConnectionAuthFailedError when the connection needs reconnect', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify(
          buildConnection({
            id: 'broken',
            authFailedAt: '2024-01-02T00:00:00.000Z',
          }),
        ),
        { status: 200 },
      ),
    );

    const error = await getConnection('broken').catch((caught) => caught);

    expect(error).toBeInstanceOf(AppConnectionAuthFailedError);
    expect((error as AppConnectionAuthFailedError).connectionId).toBe('broken');
  });

  it('surfaces non-2xx HTTP responses as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      new Response('not found', { status: 404, statusText: 'Not Found' }),
    );

    await expect(getConnection('missing')).rejects.toThrow(/HTTP 404/);
  });

  it('throws when the runtime env vars are missing', async () => {
    delete process.env.TWENTY_API_URL;

    await expect(getConnection('any')).rejects.toThrow(
      /requires the app runtime env vars/,
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
