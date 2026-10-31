import { type AiRunEvent } from 'twenty-shared/application';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { streamRun } from '@/sdk/logic-function/ai/stream-run';

const STARTED: AiRunEvent = {
  id: 'run-id:started',
  runId: 'run-id',
  type: 'RUN_STARTED',
  createdAt: '2026-10-31T10:00:00.000Z',
};
const MESSAGE: AiRunEvent = {
  id: 'reply-id:text:0',
  runId: 'run-id',
  type: 'MESSAGE',
  createdAt: '2026-10-31T10:00:02.000Z',
  role: 'assistant',
  text: 'Done',
};

const toNextEvent = (result: {
  data?: { onAiRunEvent: AiRunEvent };
  errors?: { message: string }[];
}) => `event: next\ndata: ${JSON.stringify(result)}\n\n`;

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

const collect = async (events: AsyncIterable<AiRunEvent>) => {
  const collected: AiRunEvent[] = [];

  for await (const event of events) {
    collected.push(event);
  }

  return collected;
};

describe('streamRun', () => {
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

  it('yields each event the subscription sends until it completes', async () => {
    const message = toNextEvent({ data: { onAiRunEvent: MESSAGE } });

    fetchSpy.mockResolvedValue(
      mockServerSentEvents([
        ':\n\n',
        toNextEvent({ data: { onAiRunEvent: STARTED } }),
        message.slice(0, 20),
        message.slice(20),
        'event: complete\n\n',
      ]),
    );

    const events = await collect(streamRun({ runId: 'run-id', after: 'x' }));

    expect(events).toEqual([STARTED, MESSAGE]);

    const [url, requestInit] = fetchSpy.mock.calls[0];
    const sentBody = JSON.parse(String(requestInit?.body));

    expect(url).toBe('https://api.test/metadata');
    expect(requestInit?.headers).toEqual(
      expect.objectContaining({
        Accept: 'text/event-stream',
        Authorization: 'Bearer app-token',
      }),
    );
    expect(sentBody.query).toContain('onAiRunEvent(');
    expect(sentBody.variables).toEqual({ runId: 'run-id', after: 'x' });
  });

  it('surfaces subscription errors as a regular Error', async () => {
    fetchSpy.mockResolvedValue(
      mockServerSentEvents([
        toNextEvent({ errors: [{ message: 'Run run-id not found' }] }),
      ]),
    );

    await expect(collect(streamRun({ runId: 'run-id' }))).rejects.toThrow(
      'streamRun() failed: Run run-id not found',
    );
  });

  it('fails when the stream closes without completing, so the caller can resume', async () => {
    fetchSpy.mockResolvedValue(
      mockServerSentEvents([toNextEvent({ data: { onAiRunEvent: STARTED } })]),
    );

    await expect(collect(streamRun({ runId: 'run-id' }))).rejects.toThrow(
      'the stream closed early',
    );
  });

  it('does not connect once its signal is aborted', async () => {
    const events = await collect(
      streamRun({ runId: 'run-id', signal: AbortSignal.abort() }),
    );

    expect(events).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
