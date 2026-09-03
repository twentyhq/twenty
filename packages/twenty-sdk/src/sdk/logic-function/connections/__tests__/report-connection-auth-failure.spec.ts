import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { reportConnectionAuthFailure } from '@/sdk/logic-function/connections/report-connection-auth-failure';

describe('reportConnectionAuthFailure', () => {
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

  it('sends the mutation with the connection id and reason', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { reportAppConnectionAuthFailure: true } }),
        { status: 200 },
      ),
    );

    await reportConnectionAuthFailure({
      connectionId: 'c-1',
      reason: 'Slack rejected the token',
    });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(String(url)).toBe('https://api.test/metadata');

    const body = JSON.parse(String(requestInit?.body));

    expect(body.query).toContain('reportAppConnectionAuthFailure');
    expect(body.variables).toEqual({
      input: { id: 'c-1', reason: 'Slack rejected the token' },
    });
  });

  it('omits the reason when none is given', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ data: { reportAppConnectionAuthFailure: true } }),
        { status: 200 },
      ),
    );

    await reportConnectionAuthFailure({ connectionId: 'c-2' });

    const body = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));

    expect(body.variables).toEqual({ input: { id: 'c-2' } });
  });

  it('propagates a GraphQL error', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({ errors: [{ message: 'Connection c-3 not found' }] }),
        { status: 200 },
      ),
    );

    await expect(
      reportConnectionAuthFailure({ connectionId: 'c-3' }),
    ).rejects.toThrow('Connection c-3 not found');
  });
});
