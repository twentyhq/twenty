import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendReplyPartsOnce } from 'src/logic-functions/data/send-reply-parts-once.util';

const { store } = vi.hoisted(() => ({ store: new Map<string, unknown>() }));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: {
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: unknown) => {
      store.set(key, value);
    },
    delete: async (key: string) => store.delete(key),
  },
}));

describe('sendReplyPartsOnce', () => {
  beforeEach(() => {
    store.clear();
  });

  it('resumes after the last part that was sent', async () => {
    const sendText = vi.fn(async () => 'mid-text');
    const sendFailingAttachment = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('upload failed'))
      .mockResolvedValueOnce('mid-file');

    const sendParts = [sendText, sendFailingAttachment];

    await expect(
      sendReplyPartsOnce({ idempotencyKey: 'reply-1', sendParts }),
    ).rejects.toThrow('upload failed');

    expect(
      await sendReplyPartsOnce({ idempotencyKey: 'reply-1', sendParts }),
    ).toEqual(['mid-text', 'mid-file']);
    expect(sendText).toHaveBeenCalledTimes(1);
    expect(store.size).toBe(0);
  });

  it('sends every part when there is no idempotency key', async () => {
    const sendText = vi.fn(async () => 'mid-text');

    expect(
      await sendReplyPartsOnce({
        idempotencyKey: undefined,
        sendParts: [sendText],
      }),
    ).toEqual(['mid-text']);
    expect(store.size).toBe(0);
  });
});
