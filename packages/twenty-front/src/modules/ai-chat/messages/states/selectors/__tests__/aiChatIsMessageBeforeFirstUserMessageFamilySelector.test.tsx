import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatIsMessageBeforeFirstUserMessageFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatIsMessageBeforeFirstUserMessageFamilySelector';
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
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('aiChatIsMessageBeforeFirstUserMessageFamilySelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(
      aiChatThreadDisplayedMessagesFamilyState.atomFamily({
        threadId: THREAD_ID,
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
        useAtomFamilySelectorValue(
          aiChatIsMessageBeforeFirstUserMessageFamilySelector,
          { threadId: THREAD_ID, messageId },
        ),
      { wrapper: Wrapper },
    );

    expect(result.current).toBe(expected);
  });
});
