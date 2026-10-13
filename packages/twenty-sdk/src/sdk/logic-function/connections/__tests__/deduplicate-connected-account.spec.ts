import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { deduplicateConnectedAccount } from '@/sdk/logic-function/connections/deduplicate-connected-account';

describe('deduplicateConnectedAccount', () => {
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

  it('sends the mutation with the connection, external account id and handle, and returns the connection and outcome', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            deduplicateConnectedAccount: {
              connectedAccountId: 'c-0',
              outcome: 'MERGED',
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await deduplicateConnectedAccount({
      connectedAccountId: 'c-1',
      externalAccountId: 'T123:U456',
      handle: 'jane@example.com',
    });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(String(url)).toBe('https://api.test/metadata');

    const body = JSON.parse(String(requestInit?.body));

    expect(body.query).toContain('deduplicateConnectedAccount');
    expect(body.variables).toEqual({
      input: {
        connectedAccountId: 'c-1',
        externalAccountId: 'T123:U456',
        handle: 'jane@example.com',
      },
    });
    expect(result).toEqual({ connectedAccountId: 'c-0', outcome: 'MERGED' });
  });

  it('omits the handle when none is given', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            deduplicateConnectedAccount: {
              connectedAccountId: 'c-2',
              outcome: 'IDENTIFIED',
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await deduplicateConnectedAccount({
      connectedAccountId: 'c-2',
      externalAccountId: 'T123:U456',
    });

    const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));

    expect(body.variables).toEqual({
      input: { connectedAccountId: 'c-2', externalAccountId: 'T123:U456' },
    });
    expect(result).toEqual({
      connectedAccountId: 'c-2',
      outcome: 'IDENTIFIED',
    });
  });

  it('propagates a GraphQL error', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: 'Connection c-3 not found' }] }),
        { status: 200 },
      ),
    );

    await expect(
      deduplicateConnectedAccount({
        connectedAccountId: 'c-3',
        externalAccountId: 'T123:U456',
      }),
    ).rejects.toThrow('Connection c-3 not found');
  });
});
