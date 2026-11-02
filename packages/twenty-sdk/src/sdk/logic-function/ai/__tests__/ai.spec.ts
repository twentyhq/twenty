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
    vi.stubEnv('TWENTY_API_URL', 'https://api.test');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-token');
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: { generate: RESULT } }), {
        status: 200,
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
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

  it('acts as the person who triggered the run rather than the application', async () => {
    process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN = 'application-token';

    try {
      await ai.generate({ input: 'Is Acme a good fit?' });

      expect(
        new Headers(fetchSpy.mock.calls[0][1]?.headers).get('Authorization'),
      ).toBe('Bearer app-token');
    } finally {
      delete process.env.TWENTY_APP_APPLICATION_ACCESS_TOKEN;
    }
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

const mockRunChannel = ({
  fetchSpy,
  isKeepaliveHeld = false,
}: {
  fetchSpy: MockInstance<typeof fetch>;
  isKeepaliveHeld?: boolean;
}) => {
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

          if (!isKeepaliveHeld) {
            controller.enqueue(toNextEvent({ type: 'keepalive' }));
          }
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
    fail: () => channel?.error(new Error('Network down')),
    releaseKeepalive: () =>
      channel?.enqueue(toNextEvent({ type: 'keepalive' })),
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
    const runChannel = mockRunChannel({ fetchSpy });
    const chunks: Record<string, unknown>[] = [];

    const generation = ai.generate({
      input: 'Is Acme a good fit?',
      onChunk: (chunk) => {
        chunks.push(chunk);
      },
    });

    await vi.waitFor(() =>
      expect(runChannel.requests).toEqual(['subscription', 'mutation']),
    );

    const [subscriptionCall, mutationCall] = fetchSpy.mock.calls;

    const subscriptionBody = JSON.parse(String(subscriptionCall[1]?.body));

    expect(subscriptionBody.query).toContain('onAgentChatEvent(runId: $runId)');
    // the SDK picks the run id itself, so the mutation runs on the channel it follows
    expect(
      JSON.parse(String(mutationCall[1]?.body)).variables.input,
    ).toMatchObject({ runId: subscriptionBody.variables.runId });

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
    runChannel.send({ type: 'run-finished' });

    await expect(generation).resolves.toEqual({ ...RESULT, runId: RUN_ID });
    expect(chunks).toEqual([
      { type: 'text-delta', id: 'text-1', delta: 'Acme' },
      { type: 'finish' },
    ]);
    expect(runChannel.isChannelCancelled()).toBe(true);
  });

  it('starts the run only once the subscription is live', async () => {
    const runChannel = mockRunChannel({ fetchSpy, isKeepaliveHeld: true });

    const generation = ai.generate({ input: 'Hi', onChunk: () => {} });

    await vi.waitFor(() =>
      expect(runChannel.requests).toEqual(['subscription']),
    );
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(runChannel.requests).toEqual(['subscription']);

    runChannel.releaseKeepalive();

    await vi.waitFor(() =>
      expect(runChannel.requests).toEqual(['subscription', 'mutation']),
    );

    runChannel.answerMutation({ data: { generate: RESULT } });
    runChannel.send({ type: 'run-finished' });

    await expect(generation).resolves.toEqual(RESULT);
  });

  it('follows the run and starts it with the same caller token', async () => {
    vi.stubEnv('TWENTY_APP_APPLICATION_ACCESS_TOKEN', 'application-token');
    const runChannel = mockRunChannel({ fetchSpy });

    const generation = ai.generate({ input: 'Hi', onChunk: () => {} });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    runChannel.answerMutation({ data: { generate: RESULT } });
    runChannel.send({ type: 'run-finished' });

    await expect(generation).resolves.toEqual(RESULT);
    expect(
      fetchSpy.mock.calls.map(([, requestInit]) =>
        new Headers(requestInit?.headers).get('Authorization'),
      ),
    ).toEqual(['Bearer app-token', 'Bearer app-token']);
  });

  it('closes the stream and rejects when aborted during the run', async () => {
    const runChannel = mockRunChannel({ fetchSpy });
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
    const runChannel = mockRunChannel({ fetchSpy });
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

  it('rejects when aborted while onChunk is still running after the result', async () => {
    const runChannel = mockRunChannel({ fetchSpy });
    const abortController = new AbortController();
    let isOnChunkCalled = false;

    const generation = ai.generate({
      input: 'Hi',
      onChunk: () => {
        isOnChunkCalled = true;

        return new Promise(() => {});
      },
      signal: abortController.signal,
    });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    runChannel.answerMutation({ data: { generate: RESULT } });
    runChannel.send({ type: 'stream-chunk', chunk: { type: 'start' }, seq: 1 });
    runChannel.send({ type: 'run-finished' });
    await vi.waitFor(() => expect(isOnChunkCalled).toBe(true));
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
    const runChannel = mockRunChannel({ fetchSpy });

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

  it('delivers every chunk to a slow onChunk, however long after the result', async () => {
    const runChannel = mockRunChannel({ fetchSpy });
    const chunks: Record<string, unknown>[] = [];

    const generation = ai.generate({
      input: 'Hi',
      onChunk: async (chunk) => {
        await new Promise((resolve) => setTimeout(resolve, 2_000));
        chunks.push(chunk);
      },
    });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    try {
      for (const sequence of [1, 2, 3, 4, 5]) {
        runChannel.send({
          type: 'stream-chunk',
          chunk: { type: 'text-delta', id: 'text-1', delta: `${sequence}` },
          seq: sequence,
        });
      }
      runChannel.answerMutation({ data: { generate: RESULT } });
      runChannel.send({ type: 'run-finished' });

      await vi.advanceTimersByTimeAsync(10_000);

      await expect(generation).resolves.toEqual(RESULT);
      expect(chunks.map(({ delta }) => delta)).toEqual([
        '1',
        '2',
        '3',
        '4',
        '5',
      ]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('delivers the chunks received before a lost end event, then stops after a quiet grace', async () => {
    const runChannel = mockRunChannel({ fetchSpy });
    const chunks: Record<string, unknown>[] = [];

    const generation = ai.generate({
      input: 'Hi',
      onChunk: async (chunk) => {
        await new Promise((resolve) => setTimeout(resolve, 2_000));
        chunks.push(chunk);
      },
    });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    try {
      for (const sequence of [1, 2, 3, 4, 5]) {
        runChannel.send({
          type: 'stream-chunk',
          chunk: { type: 'text-delta', id: 'text-1', delta: `${sequence}` },
          seq: sequence,
        });
      }
      runChannel.answerMutation({ data: { generate: RESULT } });

      await vi.advanceTimersByTimeAsync(10_000);

      expect(chunks).toHaveLength(5);
      expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(false);

      await vi.advanceTimersByTimeAsync(5_000);

      expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
      await expect(generation).resolves.toEqual(RESULT);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stops after the quiet grace even while keepalives keep coming', async () => {
    const runChannel = mockRunChannel({ fetchSpy });
    let isSettled = false;

    const generation = ai
      .generate({ input: 'Hi', onChunk: () => {} })
      .finally(() => {
        isSettled = true;
      });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    try {
      runChannel.answerMutation({ data: { generate: RESULT } });

      for (const _second of [1, 2, 3, 4]) {
        runChannel.send({ type: 'keepalive' });
        await vi.advanceTimersByTimeAsync(1_000);
      }

      await vi.advanceTimersByTimeAsync(1_500);

      expect(isSettled).toBe(true);
      await expect(generation).resolves.toEqual(RESULT);
    } finally {
      vi.useRealTimers();
    }
  });

  it('never runs a slow onChunk concurrently, and keeps the chunk order', async () => {
    const runChannel = mockRunChannel({ fetchSpy });
    const deliveredDeltas: unknown[] = [];
    let runningCount = 0;
    let maxRunningCount = 0;

    const generation = ai.generate({
      input: 'Hi',
      onChunk: async (chunk) => {
        runningCount += 1;
        maxRunningCount = Math.max(maxRunningCount, runningCount);
        await new Promise((resolve) => setTimeout(resolve, 20));
        deliveredDeltas.push(chunk.type === 'text-delta' ? chunk.delta : null);
        runningCount -= 1;
      },
    });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));

    for (const sequence of [1, 2, 3, 4]) {
      runChannel.send({
        type: 'stream-chunk',
        chunk: { type: 'text-delta', id: 'text-1', delta: `${sequence}` },
        seq: sequence,
      });
    }
    runChannel.send({ type: 'run-finished' });
    runChannel.answerMutation({ data: { generate: RESULT } });

    await expect(generation).resolves.toEqual(RESULT);
    expect(maxRunningCount).toBe(1);
    expect(deliveredDeltas).toEqual(['1', '2', '3', '4']);
  });

  it('resolves with the result and the chunks it received when the channel fails after the result', async () => {
    const runChannel = mockRunChannel({ fetchSpy });
    const chunks: Record<string, unknown>[] = [];

    const generation = ai.generate({
      input: 'Hi',
      onChunk: (chunk) => {
        chunks.push(chunk);
      },
    });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    runChannel.send({ type: 'stream-chunk', chunk: { type: 'start' }, seq: 1 });
    runChannel.answerMutation({ data: { generate: RESULT } });
    await new Promise((resolve) => setTimeout(resolve, 50));
    runChannel.fail();

    await expect(generation).resolves.toEqual(RESULT);
    expect(chunks).toEqual([{ type: 'start' }]);
  });

  it('still returns the billed result when the channel fails before it', async () => {
    const runChannel = mockRunChannel({ fetchSpy });

    const generation = ai.generate({ input: 'Hi', onChunk: () => {} });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    runChannel.fail();
    await new Promise((resolve) => setTimeout(resolve, 50));
    runChannel.answerMutation({ data: { generate: RESULT } });

    await expect(generation).resolves.toEqual(RESULT);
  });

  it('rejects when onChunk throws after the result', async () => {
    const runChannel = mockRunChannel({ fetchSpy });

    const generation = ai.generate({
      input: 'Hi',
      onChunk: () => {
        throw new Error('Could not render the chunk');
      },
    });

    await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
    runChannel.answerMutation({ data: { generate: RESULT } });
    await new Promise((resolve) => setTimeout(resolve, 50));
    runChannel.send({ type: 'stream-chunk', chunk: { type: 'start' }, seq: 1 });

    await expect(generation).rejects.toThrow('Could not render the chunk');
  });

  it('rejects at once when onChunk throws, without waiting for the result', async () => {
    const runChannel = mockRunChannel({ fetchSpy });

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

  it('leaves no rejection unhandled when onChunk throws before the result', async () => {
    const runChannel = mockRunChannel({ fetchSpy });
    const unhandledRejections: unknown[] = [];
    const recordUnhandledRejection = (reason: unknown) =>
      unhandledRejections.push(reason);

    process.on('unhandledRejection', recordUnhandledRejection);

    try {
      const generation = ai.generate({
        input: 'Hi',
        onChunk: () => {
          throw new Error('Could not render the chunk');
        },
      });

      await vi.waitFor(() => expect(runChannel.requests).toHaveLength(2));
      runChannel.send({
        type: 'stream-chunk',
        chunk: { type: 'start' },
        seq: 1,
      });

      await expect(generation).rejects.toThrow('Could not render the chunk');
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(unhandledRejections).toEqual([]);
    } finally {
      process.off('unhandledRejection', recordUnhandledRejection);
    }
  });

  it('stops following the run when the mutation fails', async () => {
    const runChannel = mockRunChannel({ fetchSpy });

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
