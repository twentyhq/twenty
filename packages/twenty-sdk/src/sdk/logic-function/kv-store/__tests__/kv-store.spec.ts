import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { kv } from '@/sdk/logic-function/kv-store/kv-store';

describe('kv', () => {
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

  describe('get', () => {
    it('returns the stored value', async () => {
      fetchSpy.mockResolvedValue(
        new Response(
          JSON.stringify({ data: { appKeyValue: { value: 'cached' } } }),
          { status: 200 },
        ),
      );

      const result = await kv.get('my-key');

      expect(result).toEqual({ value: 'cached' });

      const [url, requestInit] = fetchSpy.mock.calls[0];

      expect(url).toBe('https://api.test/metadata');

      const sentBody = JSON.parse(requestInit?.body as string);

      expect(sentBody.query).toContain('appKeyValue(key: $key)');
      expect(sentBody.variables).toEqual({ key: 'my-key' });
    });

    it('returns null when the key is absent', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ data: { appKeyValue: null } }), {
          status: 200,
        }),
      );

      const result = await kv.get('missing');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('POSTs the setAppKeyValue mutation with the ttl', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ data: { setAppKeyValue: true } }), {
          status: 200,
        }),
      );

      await kv.set('my-key', 'value', { ttlInSeconds: 60 });

      const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);

      expect(sentBody.query).toContain('setAppKeyValue(input: $input)');
      expect(sentBody.variables).toEqual({
        input: { key: 'my-key', value: 'value', ttlInSeconds: 60 },
      });
    });

    it('omits the ttl when not provided', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ data: { setAppKeyValue: true } }), {
          status: 200,
        }),
      );

      await kv.set('my-key', 'value');

      const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);

      expect(sentBody.variables).toEqual({
        input: { key: 'my-key', value: 'value', ttlInSeconds: undefined },
      });
    });

    it('surfaces GraphQL errors (e.g. quota exceeded) as a regular Error', async () => {
      fetchSpy.mockResolvedValue(
        new Response(
          JSON.stringify({
            errors: [{ message: 'Key-value storage quota exceeded.' }],
          }),
          { status: 200 },
        ),
      );

      await expect(kv.set('my-key', 'value')).rejects.toThrow(
        /quota exceeded/,
      );
    });
  });

  describe('delete', () => {
    it('POSTs the deleteAppKeyValue mutation', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ data: { deleteAppKeyValue: true } }), {
          status: 200,
        }),
      );

      await kv.delete('my-key');

      const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);

      expect(sentBody.query).toContain('deleteAppKeyValue(key: $key)');
      expect(sentBody.variables).toEqual({ key: 'my-key' });
    });
  });

  it('throws when the runtime env vars are missing', async () => {
    delete process.env.TWENTY_API_URL;

    await expect(kv.get('my-key')).rejects.toThrow(
      /requires the app runtime env vars/,
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
