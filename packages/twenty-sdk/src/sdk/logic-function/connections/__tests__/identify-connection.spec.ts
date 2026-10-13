import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { identifyConnection } from '@/sdk/logic-function/connections/identify-connection';

describe('identifyConnection', () => {
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

  it('sends the mutation with the connection, external account id and handle, and returns the connection and status', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            identifyAppConnection: {
              connectedAccountId: 'c-0',
              status: 'MERGED_INTO_EXISTING',
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await identifyConnection({
      connectedAccountId: 'c-1',
      externalAccountId: 'T123:U456',
      handle: 'jane@example.com',
    });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(String(url)).toBe('https://api.test/metadata');

    const body = JSON.parse(String(requestInit?.body));

    expect(body.query).toContain('identifyAppConnection');
    expect(body.variables).toEqual({
      input: {
        connectedAccountId: 'c-1',
        externalAccountId: 'T123:U456',
        handle: 'jane@example.com',
      },
    });
    expect(result).toEqual({
      connectedAccountId: 'c-0',
      status: 'MERGED_INTO_EXISTING',
    });
  });

  it('omits the handle when none is given', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            identifyAppConnection: {
              connectedAccountId: 'c-2',
              status: 'IDENTIFIED',
            },
          },
        }),
        { status: 200 },
      ),
    );

    const result = await identifyConnection({
      connectedAccountId: 'c-2',
      externalAccountId: 'T123:U456',
    });

    const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));

    expect(body.variables).toEqual({
      input: { connectedAccountId: 'c-2', externalAccountId: 'T123:U456' },
    });
    expect(result).toEqual({
      connectedAccountId: 'c-2',
      status: 'IDENTIFIED',
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
      identifyConnection({
        connectedAccountId: 'c-3',
        externalAccountId: 'T123:U456',
      }),
    ).rejects.toThrow('Connection c-3 not found');
  });
});
