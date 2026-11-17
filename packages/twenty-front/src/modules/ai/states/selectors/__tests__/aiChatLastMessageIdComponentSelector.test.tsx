import {
  AiChatTestInstance,
  aiChatTestDisplayedThreadIdAtom,
} from '@/ai/testing/AiChatTestInstance';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { aiChatLastMessageIdComponentSelector } from '@/ai/states/selectors/aiChatLastMessageIdComponentSelector';
import { aiChatNonLastMessageIdsComponentSelector } from '@/ai/states/selectors/aiChatNonLastMessageIdsComponentSelector';
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
  <JotaiProvider store={jotaiStore}>
    <AiChatTestInstance>{children}</AiChatTestInstance>
  </JotaiProvider>
);

describe('aiChatLastMessageIdComponentSelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(aiChatTestDisplayedThreadIdAtom, THREAD_ID);
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
        aiChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
        messages,
      );

      const { result } = renderHook(
        () => ({
          nonLastMessageIds: useAtomComponentSelectorValue(
            aiChatNonLastMessageIdsComponentSelector,
          ),
          lastMessageId: useAtomComponentSelectorValue(
            aiChatLastMessageIdComponentSelector,
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
