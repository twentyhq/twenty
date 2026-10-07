import { describe, expect, it } from 'vitest';

import { readEventStream } from '@/transport/graphql/read-event-stream';

const collect = async (chunks: Uint8Array[], frameByteLimit?: number) => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
  const messages = [];
  for await (const message of readEventStream({
    body,
    signal: new AbortController().signal,
    frameByteLimit,
  })) {
    messages.push(message);
  }
  return messages;
};

describe('bounded event stream reader', () => {
  it.each(['\n', '\r\n', '\r'])(
    'handles %j boundaries, pings, multiline data and split UTF-8',
    async (newline) => {
      const text = [
        ': ping',
        '',
        'event: next',
        'data: {"logs":',
        'data: "café 😀"}',
        '',
        'event: complete',
        '',
        '',
      ].join(newline);
      const bytes = Buffer.from(text);
      const chunks = Array.from(bytes, (byte) => Uint8Array.of(byte));

      expect(await collect(chunks)).toEqual([
        { event: 'next', data: '{"logs":\n"café 😀"}' },
        { event: 'complete', data: '' },
      ]);
    },
  );

  it('bounds each frame rather than the full session', async () => {
    const frame = Buffer.from('event: next\ndata: {}\n\n');
    expect(
      await collect(
        Array.from({ length: 100 }, () => frame),
        64,
      ),
    ).toHaveLength(100);
  });

  it.each([
    'data: ' + 'x'.repeat(100),
    Array.from({ length: 20 }, () => ': comment\n').join(''),
    'event: next\n' + Array.from({ length: 20 }, () => 'data: a\n').join(''),
  ])('rejects oversized unfinished lines or frames', async (text) => {
    await expect(
      collect(
        Array.from(Buffer.from(text), (byte) => Uint8Array.of(byte)),
        64,
      ),
    ).rejects.toMatchObject({
      code: 'RESPONSE_LIMIT_EXCEEDED',
      details: { byteLimit: 64 },
    });
  });

  it('does not consume another network chunk while the consumer is paused', async () => {
    let pulls = 0;
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>(
      {
        pull(controller) {
          pulls += 1;
          controller.enqueue(Buffer.from('event: next\ndata: {}\n\n'));
        },
        cancel() {
          cancelled = true;
        },
      },
      { highWaterMark: 0 },
    );
    const messages = readEventStream({
      body,
      signal: new AbortController().signal,
    });

    expect((await messages.next()).done).toBe(false);
    await new Promise((resolve) => setImmediate(resolve));
    expect(pulls).toBe(1);
    await messages.return();
    expect(cancelled).toBe(true);
    expect(body.locked).toBe(false);
  });

  it('cancels an idle reader and releases it on interruption', async () => {
    const controller = new AbortController();
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      cancel() {
        cancelled = true;
      },
    });
    const messages = readEventStream({ body, signal: controller.signal });
    const waiting = messages.next();
    controller.abort();

    await expect(waiting).rejects.toBe(controller.signal.reason);
    expect(cancelled).toBe(true);
    expect(body.locked).toBe(false);
  });
});
