import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { aiChatMessageGroupPositionFamilySelector } from '@/ai-chat/messages/states/selectors/aiChatMessageGroupPositionFamilySelector';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadViewVisitFamilyState } from '@/ai-chat/states/view/aiChatThreadViewVisitFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const THREAD_ID = 'thread';

const buildMessage = ({
  id,
  senderWorkspaceMemberId,
  createdAt,
  role = 'user',
}: {
  id: string;
  senderWorkspaceMemberId?: string;
  createdAt: string;
  role?: ExtendedUIMessage['role'];
}): ExtendedUIMessage => ({
  id,
  role,
  parts: [{ type: 'text', text: id }],
  metadata: { senderWorkspaceMemberId, createdAt },
});

const MESSAGES = [
  buildMessage({
    id: 'first-quick',
    senderWorkspaceMemberId: 'sender',
    createdAt: '2026-11-20T10:00:00.000Z',
  }),
  buildMessage({
    id: 'second-quick',
    senderWorkspaceMemberId: 'sender',
    createdAt: '2026-11-20T10:00:30.000Z',
  }),
  buildMessage({
    id: 'later',
    senderWorkspaceMemberId: 'sender',
    createdAt: '2026-11-20T10:05:00.000Z',
  }),
  buildMessage({
    id: 'reply',
    role: 'assistant',
    createdAt: '2026-11-20T10:06:00.000Z',
  }),
  buildMessage({
    id: 'teammate-read',
    senderWorkspaceMemberId: 'teammate',
    createdAt: '2026-11-20T10:07:00.000Z',
  }),
  buildMessage({
    id: 'teammate-unread',
    senderWorkspaceMemberId: 'teammate',
    createdAt: '2026-11-20T10:09:00.000Z',
  }),
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderGroupPosition = (messageId: string) =>
  renderHook(
    () =>
      useAtomFamilySelectorValue(aiChatMessageGroupPositionFamilySelector, {
        threadId: THREAD_ID,
        messageId,
      }),
    { wrapper: Wrapper },
  ).result.current;

describe('aiChatMessageGroupPositionFamilySelector', () => {
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
    {
      description: 'shares its time with a quick follow-up',
      messageId: 'first-quick',
      expected: {
        isGroupedWithPrevious: false,
        isGroupedWithNext: true,
        isTimeSharedWithNext: true,
      },
    },
    {
      description: 'keeps its time before a later follow-up',
      messageId: 'second-quick',
      expected: {
        isGroupedWithPrevious: true,
        isGroupedWithNext: true,
        isTimeSharedWithNext: false,
      },
    },
    {
      description: 'ends the group before an assistant reply',
      messageId: 'later',
      expected: {
        isGroupedWithPrevious: true,
        isGroupedWithNext: false,
        isTimeSharedWithNext: false,
      },
    },
    {
      description: 'leaves an unknown message ungrouped',
      messageId: 'unknown',
      expected: {
        isGroupedWithPrevious: false,
        isGroupedWithNext: false,
        isTimeSharedWithNext: false,
      },
    },
  ])('$description', ({ messageId, expected }) => {
    expect(renderGroupPosition(messageId)).toEqual(expected);
  });

  it('groups read messages from the same teammate', () => {
    expect(renderGroupPosition('teammate-read').isGroupedWithNext).toBe(true);
  });

  it('splits a group at the first unread message', () => {
    jotaiStore.set(
      aiChatThreadViewVisitFamilyState.atomFamily({ threadId: THREAD_ID }),
      {
        threadId: THREAD_ID,
        isUnread: true,
        lastReadAt: '2026-11-20T10:08:00.000Z',
        isKeptUnread: false,
      },
    );

    expect(renderGroupPosition('teammate-read').isGroupedWithNext).toBe(false);
    expect(renderGroupPosition('teammate-unread').isGroupedWithPrevious).toBe(
      false,
    );
  });
});
