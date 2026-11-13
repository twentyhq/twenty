import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useLeaveRemovedInboxThread } from '@/ai/hooks/useLeaveRemovedInboxThread';
import { inboxDraftsByThreadIdState } from '@/ai/states/inboxDraftsByThreadIdState';
import { inboxThreadParticipantsState } from '@/ai/states/inboxThreadParticipantsState';
import { inboxInputIsEmptySelector } from '@/ai/states/selectors/inboxInputIsEmptySelector';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { setInboxThreadList } from '@/ai/testing/setInboxThreadList';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const projectInboxThreadToUrl = jest.fn();
const loadInboxThread = jest.fn();

jest.mock('@/ai/hooks/useProjectInboxThreadToUrl', () => ({
  useProjectInboxThreadToUrl: () => ({ projectInboxThreadToUrl }),
}));

jest.mock('@/ai/hooks/useLoadInboxThread', () => ({
  useLoadInboxThread: () => ({ loadInboxThread }),
}));

const REMOVED_CHAT_ID = '20202020-0000-4000-8000-0000000000aa';
const OLDER_CHAT_ID = '20202020-0000-4000-8000-0000000000bb';
const RECENT_CHAT_ID = '20202020-0000-4000-8000-0000000000cc';
const NEW_CHAT_ID = '20202020-0000-4000-8000-0000000000dd';

const buildChat = (id: string, updatedAt: string): InboxThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  updatedAt,
  createdAt: updatedAt,
  deletedAt: null,
});

const buildFollowedParticipant = (threadId: string) => ({
  __typename: 'AgentChatThreadParticipant' as const,
  id: `participant-${threadId}`,
  threadId,
  lastReadAt: null,
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  mentionsResolvedAt: null,
  updatedAt: '2026-09-20T00:00:00.000Z',
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const leave = async () => {
  const { result } = renderHook(() => useLeaveRemovedInboxThread(), {
    wrapper: Wrapper,
  });

  await act(() => result.current.leaveRemovedInboxThread());
};

describe('useLeaveRemovedInboxThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    loadInboxThread.mockResolvedValue(null);
    jotaiStore.set(newInboxThreadIdState.atom, NEW_CHAT_ID);
    jotaiStore.set(currentInboxThreadState.atom, REMOVED_CHAT_ID);
  });

  it('moves to the most recent chat with its draft when the current one is gone', async () => {
    setInboxThreadList(jotaiStore, [
      buildChat(OLDER_CHAT_ID, '2026-09-01T00:00:00.000Z'),
      buildChat(RECENT_CHAT_ID, '2026-09-20T00:00:00.000Z'),
    ]);
    jotaiStore.set(
      inboxThreadParticipantsState.atom,
      Object.fromEntries(
        [OLDER_CHAT_ID, RECENT_CHAT_ID].map((threadId) => [
          threadId,
          buildFollowedParticipant(threadId),
        ]),
      ),
    );
    jotaiStore.set(inboxDraftsByThreadIdState.atom, {
      [RECENT_CHAT_ID]: 'Pending question',
    });

    await leave();

    expect(jotaiStore.get(currentInboxThreadState.atom)).toBe(RECENT_CHAT_ID);
    expect(jotaiStore.get(inboxInputIsEmptySelector.atom)).toBe(false);
    expect(projectInboxThreadToUrl).toHaveBeenCalledWith(RECENT_CHAT_ID);
  });

  it('opens a new chat when no chat is left', async () => {
    setInboxThreadList(jotaiStore, []);

    await leave();

    expect(jotaiStore.get(currentInboxThreadState.atom)).toBe(NEW_CHAT_ID);
  });

  it('stays on the new chat, which has no thread until its first message', async () => {
    setInboxThreadList(jotaiStore, []);
    jotaiStore.set(currentInboxThreadState.atom, NEW_CHAT_ID);

    await leave();

    expect(jotaiStore.get(currentInboxThreadState.atom)).toBe(NEW_CHAT_ID);
    expect(loadInboxThread).not.toHaveBeenCalled();
  });

  it('stays on a chat that is still listed', async () => {
    setInboxThreadList(jotaiStore, [
      buildChat(REMOVED_CHAT_ID, '2026-09-01T00:00:00.000Z'),
    ]);

    await leave();

    expect(jotaiStore.get(currentInboxThreadState.atom)).toBe(REMOVED_CHAT_ID);
    expect(loadInboxThread).not.toHaveBeenCalled();
    expect(projectInboxThreadToUrl).not.toHaveBeenCalled();
  });

  it('stays on an older chat that exists past the loaded pages', async () => {
    setInboxThreadList(jotaiStore, [
      buildChat(RECENT_CHAT_ID, '2026-09-20T00:00:00.000Z'),
    ]);
    loadInboxThread.mockResolvedValue(
      buildChat(REMOVED_CHAT_ID, '2025-01-01T00:00:00.000Z'),
    );

    await leave();

    expect(loadInboxThread).toHaveBeenCalledWith(REMOVED_CHAT_ID);
    expect(jotaiStore.get(currentInboxThreadState.atom)).toBe(REMOVED_CHAT_ID);
    expect(projectInboxThreadToUrl).not.toHaveBeenCalled();
  });
});
