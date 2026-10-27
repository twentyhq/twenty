import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { AppConnectionAuthFailedError } from '@/sdk/logic-function/connections/errors/app-connection-auth-failed.error';
import { getConnection } from '@/sdk/logic-function/connections/get-connection';
import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';
import { type AppConnectionWithoutVisibility } from '@/sdk/logic-function/connections/utils/with-legacy-connection-visibility.util';

const buildConnection = (
  overrides: Partial<
    Omit<AppConnection, 'visibility' | 'providerType' | 'accessToken'>
  > = {},
): AppConnectionWithoutVisibility => ({
  id: 'c-1',
  providerName: 'linear',
  name: 'Linear #1',
  handle: 'octocat@example.com',
  externalAccountId: null,
  scope: 'USER',
  userWorkspaceId: 'uws-me',
  workspaceMemberId: 'wm-me',
  providerType: 'oauth',
  accessToken: 'fresh',
  scopes: ['read'],
  authFailedAt: null,
  authFailedReason: null,
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

  it('narrows the token by provider type', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            appConnection: {
              ...buildConnection(),
              providerType: 'custom',
              accessToken: null,
            },
          },
        }),
        { status: 200 },
      ),
    );

    const connection = await getConnection('c-1');

    if (connection.providerType === 'oauth') {
      expectTypeOf(connection.accessToken).toEqualTypeOf<string>();
    } else {
      expectTypeOf(connection.accessToken).toEqualTypeOf<string | null>();
    }

    expect(connection).toMatchObject({
      providerType: 'custom',
      accessToken: null,
    });
  });

  it('queries appConnection by id over GraphQL and derives the deprecated visibility', async () => {
    const connection = buildConnection({ id: 'persisted' });

    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { appConnection: connection } }), {
        status: 200,
      }),
    );

    const result = await getConnection('persisted');

    expect(result).toEqual({ ...connection, visibility: 'user' });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');
    expect(requestInit).toEqual(
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer app-token',
        }),
      }),
    );

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('appConnection(id: $id)');
    expect(sentBody.query).toMatch(/\bscope\b/);
    expect(sentBody.query).not.toContain('visibility');
    expect(sentBody.variables).toEqual({ id: 'persisted' });
  });

  it('throws AppConnectionAuthFailedError when the connection needs reconnect', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            appConnection: buildConnection({
              id: 'broken',
              authFailedAt: '2024-01-02T00:00:00.000Z',
            }),
          },
        }),
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
