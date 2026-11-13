import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { aiChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { aiChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { aiChatLastMessageIdSelector } from '@/ai/states/selectors/agentChatLastMessageIdSelector';
import { aiChatNonLastMessageIdsSelector } from '@/ai/states/selectors/agentChatNonLastMessageIdsSelector';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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

describe('aiChatLastMessageIdSelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(aiChatDisplayedThreadState.atom, THREAD_ID);
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
          nonLastMessageIds: useAtomStateValue(aiChatNonLastMessageIdsSelector),
          lastMessageId: useAtomStateValue(aiChatLastMessageIdSelector),
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
