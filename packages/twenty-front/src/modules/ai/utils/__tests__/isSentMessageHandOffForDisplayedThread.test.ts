import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { isSentMessageHandOffForDisplayedThread } from '@/ai/utils/isSentMessageHandOffForDisplayedThread';

describe('isSentMessageHandOffForDisplayedThread', () => {
  it.each([
    {
      description: 'matches a message sent from the thread on display',
      handOffThreadId: 'thread',
      threadIdCreatedFromDraft: null,
      expected: true,
    },
    {
      description:
        'matches a message sent before its draft thread finished being created',
      handOffThreadId: AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
      threadIdCreatedFromDraft: 'thread',
      expected: true,
    },
    {
      description: 'ignores a message sent from another thread',
      handOffThreadId: 'another-thread',
      threadIdCreatedFromDraft: null,
      expected: false,
    },
  ])(
    '$description',
    ({ handOffThreadId, threadIdCreatedFromDraft, expected }) => {
      expect(
        isSentMessageHandOffForDisplayedThread({
          handOffThreadId,
          displayedThreadId: 'thread',
          threadIdCreatedFromDraft,
        }),
      ).toBe(expected);
    },
  );
});
