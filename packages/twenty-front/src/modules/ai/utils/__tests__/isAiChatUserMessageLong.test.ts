import { isAiChatUserMessageLong } from '@/ai/utils/isAiChatUserMessageLong';

describe('isAiChatUserMessageLong', () => {
  it('keeps a short message open', () => {
    expect(isAiChatUserMessageLong('Which deals close this week?')).toBe(false);
  });

  it('keeps short lines open since markdown joins them into one paragraph', () => {
    const shortLines = Array.from(
      { length: 20 },
      (_, index) => `Step ${index + 1}`,
    ).join('\n');

    expect(isAiChatUserMessageLong(shortLines)).toBe(false);
  });

  it('flags a message of 1500 characters or more', () => {
    expect(isAiChatUserMessageLong('a'.repeat(1499))).toBe(false);
    expect(isAiChatUserMessageLong('a'.repeat(1500))).toBe(true);
  });
});
