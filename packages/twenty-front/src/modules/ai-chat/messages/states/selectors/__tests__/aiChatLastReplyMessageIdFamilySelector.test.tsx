import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatLastReplyMessageIdFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatLastReplyMessageIdFamilySelector';
import { aiChatNonLastMessageIdsFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatNonLastMessageIdsFamilySelector';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const THREAD_ID = 'thread';

const USER_MESSAGE = { id: 'user-message', role: 'user' as const, parts: [] };
const ASSISTANT_MESSAGE = {
  id: 'assistant-message',
  role: 'assistant' as const,
  parts: [],
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('aiChatLastReplyMessageIdFamilySelector', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it.each([
    {
      description:
        'keeps a message the user just sent in the list so it stays mounted when the reply starts',
      messages: [USER_MESSAGE],
      expectedNonLastMessageIds: ['user-message'],
      expectedLastMessageId: null,
    },
    {
      description: 'gives the reply the streaming slot',
      messages: [USER_MESSAGE, ASSISTANT_MESSAGE],
      expectedNonLastMessageIds: ['user-message'],
      expectedLastMessageId: 'assistant-message',
    },
  ])(
    '$description',
    ({ messages, expectedNonLastMessageIds, expectedLastMessageId }) => {
      jotaiStore.set(
        aiChatThreadDisplayedMessagesFamilyState.atomFamily({
          threadId: THREAD_ID,
        }),
        messages,
      );

      const { result } = renderHook(
        () => ({
          nonLastMessageIds: useAtomFamilySelectorValue(
            aiChatNonLastMessageIdsFamilySelector,
            THREAD_ID,
          ),
          lastMessageId: useAtomFamilySelectorValue(
            aiChatLastReplyMessageIdFamilySelector,
            THREAD_ID,
          ),
        }),
        { wrapper: Wrapper },
      );

      expect(result.current).toEqual({
        nonLastMessageIds: expectedNonLastMessageIds,
        lastMessageId: expectedLastMessageId,
      });
    },
  );
});
