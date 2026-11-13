import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { inboxMessagesFamilyState } from '@/ai/states/inboxMessagesFamilyState';
import { inboxLastMessageIdSelector } from '@/ai/states/selectors/inboxLastMessageIdSelector';
import { inboxNonLastMessageIdsSelector } from '@/ai/states/selectors/inboxNonLastMessageIdsSelector';
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

describe('inboxLastMessageIdSelector', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(inboxDisplayedThreadState.atom, THREAD_ID);
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
        inboxMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
        messages,
      );

      const { result } = renderHook(
        () => ({
          nonLastMessageIds: useAtomStateValue(inboxNonLastMessageIdsSelector),
          lastMessageId: useAtomStateValue(inboxLastMessageIdSelector),
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
