import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  consumeSentAttachmentMessage,
  rememberSentAttachmentMessages,
} from 'src/logic-functions/data/sent-attachment-message.util';

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

describe('sent attachment messages', () => {
  beforeEach(() => {
    store.clear();
  });

  it('recognizes the echo of an attachment sent from Twenty once', async () => {
    await rememberSentAttachmentMessages(['mid-2', 'mid-3']);

    expect(await consumeSentAttachmentMessage('mid-2')).toBe(true);
    expect(await consumeSentAttachmentMessage('mid-2')).toBe(false);
    expect(await consumeSentAttachmentMessage('mid-3')).toBe(true);
  });

  it('does not recognize other messages', async () => {
    expect(await consumeSentAttachmentMessage('mid-1')).toBe(false);
  });
});
