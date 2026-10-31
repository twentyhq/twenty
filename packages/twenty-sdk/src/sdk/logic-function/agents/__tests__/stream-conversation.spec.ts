import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { streamConversation } from '@/sdk/logic-function/agents/stream-conversation';

const CONVERSATION = {
  agentUniversalIdentifier: 'agent-uid',
  threadKey: 'deal-42',
};
const KEEPALIVE: AgentChatSubscriptionEvent = { type: 'keepalive' };
const CHUNK: AgentChatSubscriptionEvent = {
  type: 'stream-chunk',
  chunk: { type: 'text-delta', id: 'text-1', delta: 'Acme renews' },
  seq: 3,
};

const toNextEvent = (result: {
  data?: { onAgentChatEvent: { event: AgentChatSubscriptionEvent } };
  errors?: { message: string }[];
}) => `event: next\ndata: ${JSON.stringify(result)}\n\n`;

const toEventData = (event: AgentChatSubscriptionEvent) => ({
  data: { onAgentChatEvent: { event } },
});

const mockServerSentEvents = (chunks: string[]) =>
  new Response(
    new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) =>
          controller.enqueue(new TextEncoder().encode(chunk)),
        );
        controller.close();
      },
    }),
    { status: 200, headers: { 'Content-Type': 'text/event-stream' } },
  );

const collect = async (events: AsyncIterable<AgentChatSubscriptionEvent>) => {
  const collected: AgentChatSubscriptionEvent[] = [];

  for await (const event of events) {
    collected.push(event);
  }

  return collected;
};

describe('streamConversation', () => {
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

  it('yields the chat events the subscription sends until it completes', async () => {
    const chunk = toNextEvent(toEventData(CHUNK));

    fetchSpy.mockResolvedValue(
      mockServerSentEvents([
        ':\n\n',
        toNextEvent(toEventData(KEEPALIVE)),
        chunk.slice(0, 20),
        chunk.slice(20),
        'event: complete\n\n',
      ]),
    );

    expect(await collect(streamConversation(CONVERSATION))).toEqual([
      KEEPALIVE,
      CHUNK,
    ]);

    const [url, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(String(requestInit?.body));

    expect(url).toBe('https://api.test/metadata');
    expect(requestInit?.headers).toEqual(
      expect.objectContaining({
        Accept: 'text/event-stream',
        Authorization: 'Bearer app-token',
      }),
    );
    expect(sentBody.query).toContain('onAgentChatEvent(');
    expect(sentBody.variables).toEqual(CONVERSATION);
  });

  it('surfaces subscription errors as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      mockServerSentEvents([
        toNextEvent({ errors: [{ message: 'Agent agent-uid not found' }] }),
      ]),
    );

    await expect(collect(streamConversation(CONVERSATION))).rejects.toThrow(
      'streamConversation() failed: Agent agent-uid not found',
    );
  });

  it('fails when the stream closes without completing, so the caller can resume', async () => {
    fetchSpy.mockResolvedValue(
      mockServerSentEvents([toNextEvent(toEventData(KEEPALIVE))]),
    );

    await expect(collect(streamConversation(CONVERSATION))).rejects.toThrow(
      'the stream closed early',
    );
  });

  it('stops without failing when aborted while connecting', async () => {
    const abortController = new AbortController();

    fetchSpy.mockImplementation(
      (_url, requestInit) =>
        new Promise((_resolve, reject) => {
          requestInit?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          );
        }),
    );

    const events = collect(
      streamConversation({ ...CONVERSATION, signal: abortController.signal }),
    );

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    abortController.abort();

    await expect(events).resolves.toEqual([]);
  });

  it('does not connect once its signal is aborted', async () => {
    const events = await collect(
      streamConversation({ ...CONVERSATION, signal: AbortSignal.abort() }),
    );

    expect(events).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
