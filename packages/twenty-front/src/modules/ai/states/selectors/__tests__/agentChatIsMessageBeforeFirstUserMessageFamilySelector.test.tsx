import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { agentChatIsMessageBeforeFirstUserMessageFamilySelector } from '@/ai/states/selectors/agentChatIsMessageBeforeFirstUserMessageFamilySelector';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

const THREAD_ID = 'thread';

const MESSAGES = [
  { id: 'system-message', role: 'system' as const, parts: [] },
  { id: 'opening-message', role: 'assistant' as const, parts: [] },
  { id: 'user-message', role: 'user' as const, parts: [] },
  { id: 'reply-message', role: 'assistant' as const, parts: [] },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('agentChatIsMessageBeforeFirstUserMessageFamilySelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(agentChatDisplayedThreadState.atom, THREAD_ID);
    jotaiStore.set(
      agentChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
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
        useAtomFamilySelectorValue(
          agentChatIsMessageBeforeFirstUserMessageFamilySelector,
          { messageId },
        ),
      { wrapper: Wrapper },
    );

    expect(result.current).toBe(expected);
  });
});
