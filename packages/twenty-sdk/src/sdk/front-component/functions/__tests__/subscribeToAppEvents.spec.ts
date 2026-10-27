import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { subscribeToAppEvents } from '@/sdk/front-component/functions/subscribeToAppEvents';

const buildStreamResponse = (body: string) =>
  new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(body));
        controller.close();
      },
    }),
    { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
  );

describe('subscribeToAppEvents', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'member-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('POSTs the subscriptions and delivers occurrences', async () => {
    const abortController = new AbortController();
    const occurrence = {
      id: 'occurrence-1',
      event: 'messageAdded',
      occurredAt: '2026-10-27T10:00:00.000Z',
      properties: { conversationId: 'conversation-1' },
    };

    fetchSpy.mockResolvedValue(
      buildStreamResponse(
        `: connected\n\nid: occurrence-1\nevent: occurrence\ndata: ${JSON.stringify(occurrence)}\n\n`,
      ),
    );

    const onEvent = vi.fn(() => abortController.abort());
    const onConnected = vi.fn();

    await subscribeToAppEvents({
      subscriptions: [{ event: 'messageAdded', recordId: 'conversation-1' }],
      onEvent,
      onConnected,
      signal: abortController.signal,
    });

    expect(onConnected).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith(occurrence);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/rest/app-events/stream');
    expect(new Headers(requestInit?.headers).get('Authorization')).toBe(
      'Bearer member-token',
    );
    expect(JSON.parse(requestInit?.body as string)).toEqual({
      subscriptions: [{ event: 'messageAdded', recordId: 'conversation-1' }],
    });
  });

  it('stops without retrying when the subscription is refused', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    fetchSpy.mockResolvedValue(new Response(null, { status: 403 }));

    await subscribeToAppEvents({
      subscriptions: [{ event: 'messageAdded', recordId: 'conversation-1' }],
      onEvent: vi.fn(),
      signal: new AbortController().signal,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });
});
