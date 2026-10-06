import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatIsMessageBeforeFirstUserMessageComponentFamilySelector } from '@/ai/states/selectors/agentChatIsMessageBeforeFirstUserMessageComponentFamilySelector';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const INSTANCE_ID = 'agentChatIsMessageBeforeFirstUserMessageTest';
const THREAD_ID = 'thread';

const MESSAGES = [
  { id: 'system-message', role: 'system' as const, parts: [] },
  { id: 'opening-message', role: 'assistant' as const, parts: [] },
  { id: 'user-message', role: 'user' as const, parts: [] },
  { id: 'reply-message', role: 'assistant' as const, parts: [] },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: INSTANCE_ID }}
    >
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </JotaiProvider>
);

describe('agentChatIsMessageBeforeFirstUserMessageComponentFamilySelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
    jotaiStore.set(
      agentChatMessagesComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: { threadId: THREAD_ID },
      }),
      MESSAGES,
    );
  });

  it.each([
    { messageId: 'opening-message', expected: true },
    { messageId: 'user-message', expected: false },
    { messageId: 'reply-message', expected: false },
    { messageId: 'unknown-message', expected: false },
  ])('returns $expected for $messageId', ({ messageId, expected }) => {
    const { result } = renderHook(
      () =>
        useAtomComponentFamilySelectorValue(
          agentChatIsMessageBeforeFirstUserMessageComponentFamilySelector,
          { messageId },
        ),
      { wrapper: Wrapper },
    );

    expect(result.current).toBe(expected);
  });
});
