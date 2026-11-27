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

const SUBSCRIPTIONS = [{ event: 'messageAdded', recordId: 'conversation-1' }];

const buildStreamResponse = (messages: unknown[]) =>
  new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            `:\n\n${messages
              .map(
                (message) =>
                  `event: next\ndata: ${JSON.stringify(message)}\n\n`,
              )
              .join('')}event: complete\ndata:\n\n`,
          ),
        );
        controller.close();
      },
    }),
    { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
  );

const CONNECTED_MESSAGE = { data: { onAppEvent: { occurrence: null } } };

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

  it('subscribes over the metadata API and delivers occurrences', async () => {
    const abortController = new AbortController();
    const occurrence = {
      id: 'occurrence-1',
      type: 'messageAdded',
      occurredAt: '2026-10-27T10:00:00.000Z',
      properties: { conversationId: 'conversation-1' },
    };

    fetchSpy.mockResolvedValue(
      buildStreamResponse([
        CONNECTED_MESSAGE,
        { data: { onAppEvent: { occurrence } } },
      ]),
    );

    const onEvent = vi.fn(() => abortController.abort());
    const onConnected = vi.fn();

    await subscribeToAppEvents({
      subscriptions: SUBSCRIPTIONS,
      onEvent,
      onConnected,
      signal: abortController.signal,
    });

    expect(onConnected).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledWith(occurrence);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');
    expect(new Headers(requestInit?.headers).get('Authorization')).toBe(
      'Bearer member-token',
    );
    expect(JSON.parse(requestInit?.body as string).variables).toEqual({
      input: { subscriptions: SUBSCRIPTIONS },
    });
  });

  it('stops without retrying when the subscription is refused', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    fetchSpy.mockResolvedValue(
      buildStreamResponse([
        {
          errors: [
            {
              message: 'You are not allowed to receive these events.',
              extensions: { code: 'FORBIDDEN' },
            },
          ],
        },
      ]),
    );

    await subscribeToAppEvents({
      subscriptions: SUBSCRIPTIONS,
      onEvent: vi.fn(),
      signal: new AbortController().signal,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });

  it('stops when the access token is refused and cannot be refreshed', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    fetchSpy.mockResolvedValue(
      buildStreamResponse([
        {
          errors: [
            {
              message: 'Your session has expired.',
              extensions: { code: 'UNAUTHENTICATED' },
            },
          ],
        },
      ]),
    );

    await subscribeToAppEvents({
      subscriptions: SUBSCRIPTIONS,
      onEvent: vi.fn(),
      signal: new AbortController().signal,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });
});
