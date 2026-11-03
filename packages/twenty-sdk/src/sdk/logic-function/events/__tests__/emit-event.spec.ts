import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { emitEvent } from '@/sdk/logic-function/events/emit-event';

describe('emitEvent', () => {
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

  it('POSTs the emitAppEvent mutation to /metadata and returns the occurrence', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            emitAppEvent: {
              id: 'occurrence-1',
              occurredAt: '2026-10-27T10:00:00.000Z',
            },
          },
        }),
        { status: 200 },
      ),
    );

    const input = {
      event: 'messageAdded',
      properties: { conversationId: 'conversation-1', text: 'Hello' },
      anonymousId: 'visitor-1',
    };

    const result = await emitEvent(input);

    expect(result).toEqual({
      id: 'occurrence-1',
      occurredAt: '2026-10-27T10:00:00.000Z',
    });

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');
    expect(JSON.parse(requestInit?.body as string).variables).toEqual({
      input,
    });
  });

  it('throws with the server error messages', async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [{ message: 'Event "messageAdded" is not declared' }],
        }),
        { status: 200 },
      ),
    );

    await expect(emitEvent({ event: 'messageAdded' })).rejects.toThrow(
      'emitEvent() failed: Event "messageAdded" is not declared',
    );
  });
});
