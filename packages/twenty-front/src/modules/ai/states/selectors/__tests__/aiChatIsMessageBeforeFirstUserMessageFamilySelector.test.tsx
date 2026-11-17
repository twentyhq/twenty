import {
  AiChatTestInstance,
  aiChatTestDisplayedThreadIdAtom,
} from '@/ai/testing/AiChatTestInstance';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { aiChatIsMessageBeforeFirstUserMessageComponentFamilySelector } from '@/ai/states/selectors/aiChatIsMessageBeforeFirstUserMessageComponentFamilySelector';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const THREAD_ID = 'thread';

const MESSAGES = [
  { id: 'system-message', role: 'system' as const, parts: [] },
  { id: 'opening-message', role: 'assistant' as const, parts: [] },
  { id: 'user-message', role: 'user' as const, parts: [] },
  { id: 'reply-message', role: 'assistant' as const, parts: [] },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <AiChatTestInstance>{children}</AiChatTestInstance>
  </JotaiProvider>
);

describe('aiChatIsMessageBeforeFirstUserMessageComponentFamilySelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(aiChatTestDisplayedThreadIdAtom, THREAD_ID);
    jotaiStore.set(
      aiChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
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
          aiChatIsMessageBeforeFirstUserMessageComponentFamilySelector,
          { messageId },
        ),
      { wrapper: Wrapper },
    );

    expect(result.current).toBe(expected);
  });
});
