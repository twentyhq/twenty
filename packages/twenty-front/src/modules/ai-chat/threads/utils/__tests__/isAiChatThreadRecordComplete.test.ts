import { isAiChatThreadRecordComplete } from '@/ai-chat/threads/utils/isAiChatThreadRecordComplete';

describe('isAiChatThreadRecordComplete', () => {
  it('returns true once the thread carries its conversation type', () => {
    expect(
      isAiChatThreadRecordComplete({ conversationType: 'DIRECT_MESSAGE' }),
    ).toBe(true);
  });

  it('returns false for a partial or missing thread', () => {
    expect(isAiChatThreadRecordComplete({ conversationType: null })).toBe(
      false,
    );
    expect(isAiChatThreadRecordComplete({})).toBe(false);
    expect(isAiChatThreadRecordComplete(undefined)).toBe(false);
  });
});
