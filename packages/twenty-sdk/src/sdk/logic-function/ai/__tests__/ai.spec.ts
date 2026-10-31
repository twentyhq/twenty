import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import { ai } from '@/sdk/logic-function/ai/ai';

const RESULT = {
  success: true,
  text: 'Acme is a good fit.',
  object: null,
  error: null,
  runId: 'run-id',
  usage: { inputTokens: 12, outputTokens: 7 },
};

describe('ai.generate', () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    process.env.TWENTY_API_URL = 'https://api.test';
    process.env.TWENTY_APP_ACCESS_TOKEN = 'app-token';
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { generate: RESULT } }), {
        status: 200,
      }),
    );
  });

  afterEach(() => {
    delete process.env.TWENTY_API_URL;
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    fetchSpy.mockRestore();
  });

  it('POSTs the generate mutation to /metadata and returns the result', async () => {
    const result = await ai.generate({
      input: 'Is Acme a good fit?',
      instructions: 'Qualify leads for Twenty.',
    });

    expect(result).toEqual(RESULT);

    const [url, requestInit] = fetchSpy.mock.calls[0];

    expect(url).toBe('https://api.test/metadata');

    const sentBody = JSON.parse(requestInit?.body as string);

    expect(sentBody.query).toContain('generate(input: $input)');
    expect(sentBody.variables).toEqual({
      input: {
        input: [{ role: 'user', content: 'Is Acme a good fit?' }],
        instructions: 'Qualify leads for Twenty.',
      },
    });
  });

  it('sends messages and the scope as given', async () => {
    const scope = {
      objectPermissions: [
        { objectUniversalIdentifier: 'company', canReadObjectRecords: true },
      ],
    };

    await ai.generate({
      input: [
        { role: 'user', content: 'Summarize Acme.' },
        { role: 'assistant', content: 'Which period?' },
        { role: 'user', content: 'This quarter.' },
      ],
      scope,
    });

    const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);

    expect(sentBody.variables.input.input).toHaveLength(3);
    expect(sentBody.variables.input.scope).toEqual(scope);
  });
});

const RUN_ID = '3f1c9a52-7b0e-4d6a-8c2f-9e4b5a6d7c81';

const toNextEvent = (event: Record<string, unknown>) =>
  new TextEncoder().encode(
    `event: next\ndata: ${JSON.stringify({ data: { onAgentChatEvent: { event } } })}\n\n`,
  );

const isStreamRequest = (requestInit: RequestInit | undefined) =>
  new Headers(requestInit?.headers).get('Accept') === 'text/event-stream';

const mockRunChannel = (fetchSpy: MockInstance<typeof fetch>) => {
  let channel: ReadableStreamDefaultController<Uint8Array> | undefined;
  let isChannelCancelled = false;
  let answerMutation: (body: Record<string, unknown>) => void = () => {};
  const requests: string[] = [];

  fetchSpy.mockImplementation(async (_url, requestInit) => {
    const signal = requestInit?.signal;

    if (isStreamRequest(requestInit)) {
      requests.push('subscription');

      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          channel = controller;
          controller.enqueue(toNextEvent({ type: 'keepalive' }));
        },
        cancel() {
          isChannelCancelled = true;
        },
      });

      signal?.addEventListener('abort', () =>
        channel?.error(new DOMException('Aborted', 'AbortError')),
      );

      return new Response(body, { status: 200 });
    }

    requests.push('mutation');

    return new Promise<Response>((resolve, reject) => {
      signal?.addEventListener('abort', () =>
        reject(new DOMException('Aborted', 'AbortError')),
      );
      answerMutation = (body) =>
        resolve(new Response(JSON.stringify(body), { status: 200 }));
    });
  });

  return {
    requests,
    send: (event: Record<string, unknown>) =>
      channel?.enqueue(toNextEvent(event)),
    answerMutation: (body: Record<string, unknown>) => answerMutation(body),
    isChannelCancelled: () => isChannelCancelled,
  };
};

describe('ai.generate with onChunk', () => {
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

  it('follows the run from before it starts and resolves once its last chunk is delivered', async () => {
    const runChannel = mockRunChannel(fetchSpy);
    const chunks: Record<string, unknown>[] = [];

    const generation = ai.generate({
      input: 'Is Acme a good fit?',
      runId: RUN_ID,
      onChunk: (chunk) => {
        chunks.push(chunk);
      },
    });

    await vi.waitFor(() =>
      expect(runChannel.requests).toEqual(['subscription', 'mutation']),
    );

    const [subscriptionCall, mutationCall] = fetchSpy.mock.calls;

    expect(JSON.parse(String(subscriptionCall[1]?.body))).toMatchObject({
      query: expect.stringContaining('onAgentChatEvent(runId: $runId)'),
      variables: { runId: RUN_ID },
    });
    expect(
      JSON.parse(String(mutationCall[1]?.body)).variables.input,
    ).toMatchObject({ runId: RUN_ID });

    runChannel.send({
      type: 'stream-chunk',
      chunk: { type: 'text-delta', id: 'text-1', delta: 'Acme' },
      seq: 1,
    });
    runChannel.answerMutation({
      data: { generate: { ...RESULT, runId: RUN_ID } },
    });
    runChannel.send({
      type: 'stream-chunk',
      chunk: { type: 'finish' },
      seq: 2,
    });
    runChannel.send({ type: 'message-persisted', messageId: 'message-id' });

    await expect(generation).resolves.toEqual({ ...RESULT, runId: RUN_ID });
    expect(chunks).toEqual([
      { type: 'text-delta', id: 'text-1', delta: 'Acme' },
      { type: 'finish' },
    ]);
    expect(runChannel.isChannelCancelled()).toBe(true);
  });

  it('picks a run id when the caller does not', async () => {
    const runChannel = mockRunChannel(fetchSpy);

    const generation = ai.generate({ input: 'Hi', onChunk: () => {} });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));

    const subscribedRunId = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))
      .variables.runId;

    expect(
      JSON.parse(String(fetchSpy.mock.calls[1][1]?.body)).variables.input.runId,
    ).toBe(subscribedRunId);

    runChannel.answerMutation({ data: { generate: RESULT } });
    runChannel.send({ type: 'stream-error', code: 'FAILED', message: 'No' });

    await expect(generation).resolves.toEqual(RESULT);
  });

  it('closes the stream and rejects when aborted during the run', async () => {
    const runChannel = mockRunChannel(fetchSpy);
    const abortController = new AbortController();

    const generation = ai.generate({
      input: 'Hi',
      onChunk: () => {},
      signal: abortController.signal,
    });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    abortController.abort();

    await expect(generation).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it('rejects when aborted after the mutation returned but before the last chunk', async () => {
    const runChannel = mockRunChannel(fetchSpy);
    const abortController = new AbortController();
    const chunks: Record<string, unknown>[] = [];

    const generation = ai.generate({
      input: 'Hi',
      onChunk: (chunk) => {
        chunks.push(chunk);
      },
      signal: abortController.signal,
    });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    runChannel.answerMutation({ data: { generate: RESULT } });
    runChannel.send({ type: 'stream-chunk', chunk: { type: 'start' }, seq: 1 });
    await vi.waitFor(() => expect(chunks).toHaveLength(1));
    abortController.abort();

    await expect(generation).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('does not connect once its signal is aborted', async () => {
    await expect(
      ai.generate({
        input: 'Hi',
        onChunk: () => {},
        signal: AbortSignal.abort(),
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('resolves with the result when the end event never arrives', async () => {
    const runChannel = mockRunChannel(fetchSpy);

    const generation = ai.generate({ input: 'Hi', onChunk: () => {} });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    try {
      runChannel.answerMutation({ data: { generate: RESULT } });
      await vi.advanceTimersByTimeAsync(5_000);

      await expect(generation).resolves.toEqual(RESULT);
      expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects at once when onChunk throws, without waiting for the result', async () => {
    const runChannel = mockRunChannel(fetchSpy);

    const generation = ai.generate({
      input: 'Hi',
      onChunk: () => {
        throw new Error('Could not render the chunk');
      },
    });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    runChannel.send({ type: 'stream-chunk', chunk: { type: 'start' }, seq: 1 });

    await expect(generation).rejects.toThrow('Could not render the chunk');
    expect(fetchSpy.mock.calls[1][1]?.signal?.aborted).toBe(true);
  });

  it('stops following the run when the mutation fails', async () => {
    const runChannel = mockRunChannel(fetchSpy);

    const generation = ai.generate({ input: 'Hi', onChunk: () => {} });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    runChannel.answerMutation({
      errors: [{ message: 'Run already exists; pass a new runId' }],
    });

    await expect(generation).rejects.toThrow(
      'ai.generate() failed: Run already exists; pass a new runId',
    );
    expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });
});
