import { expect, it, vi } from 'vitest';

import { readBlobChunks } from '@/utils/read-blob-chunks';

it.each(['break', 'throw'] as const)(
  'cancels the stream when its consumer exits via %s',
  async (exit) => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array<ArrayBuffer>>({
      start(controller) {
        controller.enqueue(new Uint8Array([1]));
      },
      cancel,
    });
    const blob = new Blob();
    vi.spyOn(blob, 'stream').mockReturnValue(stream);
    const failure = new Error('copy failed');
    const consume = async () => {
      for await (const chunk of readBlobChunks(blob)) {
        expect(chunk).toEqual(new Uint8Array([1]));
        if (exit === 'throw') throw failure;
        break;
      }
    };
    if (exit === 'throw') await expect(consume()).rejects.toBe(failure);
    else await consume();
    expect(cancel).toHaveBeenCalledOnce();
    expect(stream.locked).toBe(false);
  },
);
