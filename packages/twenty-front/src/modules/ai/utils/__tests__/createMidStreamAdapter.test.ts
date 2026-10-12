import { type UIMessageChunk } from 'ai';

import { createMidStreamAdapter } from '@/ai/utils/createMidStreamAdapter';

const adapt = async (chunks: UIMessageChunk[]) => {
  const adaptedChunks: UIMessageChunk[] = [];
  const reader = new ReadableStream<UIMessageChunk>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  })
    .pipeThrough(createMidStreamAdapter())
    .getReader();

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      return adaptedChunks;
    }

    adaptedChunks.push(value);
  }
};

describe('createMidStreamAdapter', () => {
  it('passes a stream that starts from the beginning through unchanged', async () => {
    const chunks: UIMessageChunk[] = [
      { type: 'start', messageId: 'message-1' },
      { type: 'text-start', id: 'text-1' },
      { type: 'text-delta', id: 'text-1', delta: 'Hello' },
      { type: 'text-end', id: 'text-1' },
      { type: 'reasoning-start', id: 'reasoning-1' },
      { type: 'reasoning-delta', id: 'reasoning-1', delta: 'Thinking' },
      {
        type: 'tool-input-start',
        toolCallId: 'call-1',
        toolName: 'search',
      },
      { type: 'tool-input-delta', toolCallId: 'call-1', inputTextDelta: '{' },
    ];

    expect(await adapt(chunks)).toEqual(chunks);
  });

  it('injects start and start-step when joining mid-stream', async () => {
    const adaptedChunks = await adapt([
      { type: 'text-start', id: 'text-1' },
      { type: 'text-delta', id: 'text-1', delta: 'Hello' },
    ]);

    expect(adaptedChunks).toEqual([
      { type: 'start', messageId: expect.any(String) },
      { type: 'start-step' },
      { type: 'text-start', id: 'text-1' },
      { type: 'text-delta', id: 'text-1', delta: 'Hello' },
    ]);
  });

  it('injects text-start once for a text part whose start was missed', async () => {
    const adaptedChunks = await adapt([
      { type: 'start', messageId: 'message-1' },
      { type: 'text-delta', id: 'text-1', delta: 'Hel' },
      { type: 'text-delta', id: 'text-1', delta: 'lo' },
      { type: 'text-end', id: 'text-1' },
    ]);

    expect(adaptedChunks).toEqual([
      { type: 'start', messageId: 'message-1' },
      { type: 'text-start', id: 'text-1' },
      { type: 'text-delta', id: 'text-1', delta: 'Hel' },
      { type: 'text-delta', id: 'text-1', delta: 'lo' },
      { type: 'text-end', id: 'text-1' },
    ]);
  });

  it('injects text-start before a lone text-end', async () => {
    const adaptedChunks = await adapt([
      { type: 'start', messageId: 'message-1' },
      { type: 'text-end', id: 'text-1' },
    ]);

    expect(adaptedChunks).toEqual([
      { type: 'start', messageId: 'message-1' },
      { type: 'text-start', id: 'text-1' },
      { type: 'text-end', id: 'text-1' },
    ]);
  });

  it('injects reasoning-start for a reasoning part whose start was missed', async () => {
    const adaptedChunks = await adapt([
      { type: 'start', messageId: 'message-1' },
      { type: 'reasoning-delta', id: 'reasoning-1', delta: 'Thinking' },
      { type: 'reasoning-end', id: 'reasoning-1' },
    ]);

    expect(adaptedChunks).toEqual([
      { type: 'start', messageId: 'message-1' },
      { type: 'reasoning-start', id: 'reasoning-1' },
      { type: 'reasoning-delta', id: 'reasoning-1', delta: 'Thinking' },
      { type: 'reasoning-end', id: 'reasoning-1' },
    ]);
  });

  it('injects tool-input-start for a tool call whose start was missed', async () => {
    const adaptedChunks = await adapt([
      { type: 'start', messageId: 'message-1' },
      { type: 'tool-input-delta', toolCallId: 'call-1', inputTextDelta: '{' },
      { type: 'tool-input-delta', toolCallId: 'call-1', inputTextDelta: '}' },
    ]);

    expect(adaptedChunks).toEqual([
      { type: 'start', messageId: 'message-1' },
      { type: 'tool-input-start', toolCallId: 'call-1', toolName: 'unknown' },
      { type: 'tool-input-delta', toolCallId: 'call-1', inputTextDelta: '{' },
      { type: 'tool-input-delta', toolCallId: 'call-1', inputTextDelta: '}' },
    ]);
  });
});
