import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { kv } from '@/sdk/logic-function/key-value/kv';

describe('kv', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', 'https://api.test');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-token');
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    fetchSpy.mockRestore();
  });

  it('gets a value with the WORKSPACE scope by default', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            appKeyValue: {
              key: 'my-key',
              value: { count: 3 },
              scope: 'WORKSPACE',
            },
          },
        }),
        { status: 200 },
      ),
    );

    const value = await kv.get<{ count: number }>('my-key');

    expect(value).toEqual({ count: 3 });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('appKeyValue(key: $key, scope: $scope)');
    expect(sentBody.variables).toEqual({ key: 'my-key', scope: 'WORKSPACE' });
  });

  it('calls the internal API url when the runtime provides one', async () => {
    vi.stubEnv('TWENTY_INTERNAL_API_URL', 'http://twenty-server:3000');
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { appKeyValue: null } }), {
        status: 200,
      }),
    );

    await kv.get('my-key');

    const [url] = fetchSpy.mock.calls[0];

    expect(url).toBe('http://twenty-server:3000/metadata');
  });

  it('returns null when the key is absent', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { appKeyValue: null } }), {
        status: 200,
      }),
    );

    const value = await kv.get('missing-key');

    expect(value).toBeNull();
  });

  it('sets a value with an explicit SERVER scope', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            setAppKeyValue: {
              key: 'slack:team:T123',
              value: 'workspace-1',
              scope: 'SERVER',
            },
          },
        }),
        { status: 200 },
      ),
    );

    await kv.set('slack:team:T123', 'workspace-1', { scope: 'SERVER' });

    const [, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.variables).toEqual({
      input: {
        key: 'slack:team:T123',
        value: 'workspace-1',
        scope: 'SERVER',
      },
    });
  });

  it('deletes a key and returns whether a row was removed', async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { deleteAppKeyValue: true } }), {
        status: 200,
      }),
    );

    const deleted = await kv.delete('my-key');

    expect(deleted).toBe(true);

    const [, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.variables).toEqual({ key: 'my-key', scope: 'WORKSPACE' });
  });

  it('surfaces GraphQL errors as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [{ message: 'already claimed by another workspace' }],
        }),
        { status: 200 },
      ),
    );

    await expect(
      kv.set('slack:team:T123', undefined, { scope: 'SERVER' }),
    ).rejects.toThrow(/already claimed/);
  });
});
