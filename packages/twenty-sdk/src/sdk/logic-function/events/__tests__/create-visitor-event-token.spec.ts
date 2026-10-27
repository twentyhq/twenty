import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { createVisitorEventToken } from '@/sdk/logic-function/events/create-visitor-event-token';

describe('createVisitorEventToken', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('POSTs the createAppVisitorEventToken mutation and returns the token', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            createAppVisitorEventToken: {
              token: 'visitor-token',
              expiresAt: '2026-10-27T10:15:00.000Z',
            },
          },
        }),
        { status: 200 },
      ),
    );

    const input = {
      anonymousId: 'visitor-1',
      events: ['messageAdded'],
      expiresInSeconds: 900,
    };

    const result = await createVisitorEventToken(input);

    expect(result).toEqual({
      token: 'visitor-token',
      expiresAt: '2026-10-27T10:15:00.000Z',
    });

    const [, requestInit] = fetchSpy.mock.calls[0];

    expect(JSON.parse(requestInit?.body as string).variables).toEqual({
      input,
    });
  });
});
