import { setAiChatDraft } from '@/ai-chat/utils/setAiChatDraft';

describe('setAiChatDraft', () => {
  it('stores a non-empty draft under its thread', () => {
    expect(
      setAiChatDraft({
        drafts: { other: 'kept' },
        threadId: 'thread',
        draft: 'hello',
      }),
    ).toEqual({ other: 'kept', thread: 'hello' });
  });

  it('removes the thread entry when the draft is cleared', () => {
    expect(
      setAiChatDraft({
        drafts: { other: 'kept', thread: 'hello' },
        threadId: 'thread',
        draft: '',
      }),
    ).toEqual({ other: 'kept' });
  });

  it('returns the same map when clearing a thread without a draft', () => {
    const drafts = { other: 'kept' };

    expect(setAiChatDraft({ drafts, threadId: 'thread', draft: '' })).toBe(
      drafts,
    );
  });
});
