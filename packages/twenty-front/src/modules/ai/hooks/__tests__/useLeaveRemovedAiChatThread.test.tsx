import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useLeaveRemovedAiChatThread } from '@/ai/hooks/useLeaveRemovedAiChatThread';
import { aiChatDraftsByThreadIdState } from '@/ai/states/aiChatDraftsByThreadIdState';
import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { aiChatInputIsEmptySelector } from '@/ai/states/selectors/aiChatInputIsEmptySelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { setInboxThreadList } from '@/ai/testing/setInboxThreadList';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const projectAiChatThreadToUrl = jest.fn();
const loadAiChatThread = jest.fn();

jest.mock('@/ai/hooks/useProjectAiChatThreadToUrl', () => ({
  useProjectAiChatThreadToUrl: () => ({ projectAiChatThreadToUrl }),
}));

jest.mock('@/ai/hooks/useLoadAiChatThread', () => ({
  useLoadAiChatThread: () => ({ loadAiChatThread }),
}));

const REMOVED_CHAT_ID = '20202020-0000-4000-8000-0000000000aa';
const OLDER_CHAT_ID = '20202020-0000-4000-8000-0000000000bb';
const RECENT_CHAT_ID = '20202020-0000-4000-8000-0000000000cc';
const NEW_CHAT_ID = '20202020-0000-4000-8000-0000000000dd';

const buildChat = (id: string, updatedAt: string): AiChatThreadRecord => ({
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
  const { result } = renderHook(() => useLeaveRemovedAiChatThread(), {
    wrapper: Wrapper,
  });

  await act(() => result.current.leaveRemovedAiChatThread());
};

describe('useLeaveRemovedAiChatThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    loadAiChatThread.mockResolvedValue(null);
    jotaiStore.set(newAiChatThreadIdState.atom, NEW_CHAT_ID);
    jotaiStore.set(currentAiChatThreadState.atom, REMOVED_CHAT_ID);
  });

  it('moves to the most recent chat with its draft when the current one is gone', async () => {
    setInboxThreadList(jotaiStore, [
      buildChat(OLDER_CHAT_ID, '2026-09-01T00:00:00.000Z'),
      buildChat(RECENT_CHAT_ID, '2026-09-20T00:00:00.000Z'),
    ]);
    jotaiStore.set(
      aiChatThreadParticipantsState.atom,
      Object.fromEntries(
        [OLDER_CHAT_ID, RECENT_CHAT_ID].map((threadId) => [
          threadId,
          buildFollowedParticipant(threadId),
        ]),
      ),
    );
    jotaiStore.set(aiChatDraftsByThreadIdState.atom, {
      [RECENT_CHAT_ID]: 'Pending question',
    });

    await leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(RECENT_CHAT_ID);
    expect(jotaiStore.get(aiChatInputIsEmptySelector.atom)).toBe(false);
    expect(projectAiChatThreadToUrl).toHaveBeenCalledWith(RECENT_CHAT_ID);
  });

  it('opens a new chat when no chat is left', async () => {
    setInboxThreadList(jotaiStore, []);

    await leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(NEW_CHAT_ID);
  });

  it('stays on the new chat, which has no thread until its first message', async () => {
    setInboxThreadList(jotaiStore, []);
    jotaiStore.set(currentAiChatThreadState.atom, NEW_CHAT_ID);

    await leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(NEW_CHAT_ID);
    expect(loadAiChatThread).not.toHaveBeenCalled();
  });

  it('stays on a chat that is still listed', async () => {
    setInboxThreadList(jotaiStore, [
      buildChat(REMOVED_CHAT_ID, '2026-09-01T00:00:00.000Z'),
    ]);

    await leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(REMOVED_CHAT_ID);
    expect(loadAiChatThread).not.toHaveBeenCalled();
    expect(projectAiChatThreadToUrl).not.toHaveBeenCalled();
  });

  it('stays on an older chat that exists past the loaded pages', async () => {
    setInboxThreadList(jotaiStore, [
      buildChat(RECENT_CHAT_ID, '2026-09-20T00:00:00.000Z'),
    ]);
    loadAiChatThread.mockResolvedValue(
      buildChat(REMOVED_CHAT_ID, '2025-01-01T00:00:00.000Z'),
    );

    await leave();

    expect(loadAiChatThread).toHaveBeenCalledWith(REMOVED_CHAT_ID);
    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(REMOVED_CHAT_ID);
    expect(projectAiChatThreadToUrl).not.toHaveBeenCalled();
  });
});
