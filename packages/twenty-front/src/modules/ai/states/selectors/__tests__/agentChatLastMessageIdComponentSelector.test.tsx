import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatLastMessageIdComponentSelector } from '@/ai/states/selectors/agentChatLastMessageIdComponentSelector';
import { agentChatNonLastMessageIdsComponentSelector } from '@/ai/states/selectors/agentChatNonLastMessageIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const INSTANCE_ID = 'agentChatLastMessageIdTest';
const THREAD_ID = 'thread';

const USER_MESSAGE = { id: 'user-message', role: 'user' as const, parts: [] };
const ASSISTANT_MESSAGE = {
  id: 'assistant-message',
  role: 'assistant' as const,
  parts: [],
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: INSTANCE_ID }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </JotaiProvider>
);

describe('agentChatLastMessageIdComponentSelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
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
        agentChatMessagesComponentFamilyState.atomFamily({
          instanceId: INSTANCE_ID,
          familyKey: { threadId: THREAD_ID },
        }),
        messages,
      );

      const { result } = renderHook(
        () => ({
          nonLastMessageIds: useAtomComponentSelectorValue(
            agentChatNonLastMessageIdsComponentSelector,
          ),
          lastMessageId: useAtomComponentSelectorValue(
            agentChatLastMessageIdComponentSelector,
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
