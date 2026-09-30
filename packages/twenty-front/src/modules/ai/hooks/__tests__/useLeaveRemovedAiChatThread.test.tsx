import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useLeaveRemovedAiChatThread } from '@/ai/hooks/useLeaveRemovedAiChatThread';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const projectAiChatThreadToUrl = jest.fn();

jest.mock('@/ai/hooks/useProjectAiChatThreadToUrl', () => ({
  useProjectAiChatThreadToUrl: () => ({ projectAiChatThreadToUrl }),
}));

const REMOVED_CHAT_ID = '20202020-0000-4000-8000-0000000000aa';
const OLDER_CHAT_ID = '20202020-0000-4000-8000-0000000000bb';
const RECENT_CHAT_ID = '20202020-0000-4000-8000-0000000000cc';

const buildChat = (id: string, updatedAt: string) =>
  ({
    id,
    title: id,
    updatedAt,
    createdAt: updatedAt,
    deletedAt: null,
  }) as FlatAgentChatThread;

const setChats = (chats: FlatAgentChatThread[]) =>
  jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
    current: chats,
    draft: chats,
    status: 'up-to-date',
  });

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const leave = () => {
  const { result } = renderHook(() => useLeaveRemovedAiChatThread(), {
    wrapper: Wrapper,
  });

  act(() => result.current.leaveRemovedAiChatThread());
};

describe('useLeaveRemovedAiChatThread', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(currentAiChatThreadState.atom, REMOVED_CHAT_ID);
  });

  it('moves to the most recent chat with its draft when the current one is gone', () => {
    setChats([
      buildChat(OLDER_CHAT_ID, '2026-09-01T00:00:00.000Z'),
      buildChat(RECENT_CHAT_ID, '2026-09-20T00:00:00.000Z'),
    ]);
    jotaiStore.set(agentChatDraftsByThreadIdState.atom, {
      [RECENT_CHAT_ID]: 'Pending question',
    });

    leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(RECENT_CHAT_ID);
    expect(jotaiStore.get(agentChatInputState.atom)).toBe('Pending question');
    expect(projectAiChatThreadToUrl).toHaveBeenCalledWith(RECENT_CHAT_ID);
  });

  it('opens a new chat when no chat is left', () => {
    setChats([]);

    leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    );
  });

  it('stays on a chat that still exists', () => {
    setChats([buildChat(REMOVED_CHAT_ID, '2026-09-01T00:00:00.000Z')]);

    leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(REMOVED_CHAT_ID);
    expect(projectAiChatThreadToUrl).not.toHaveBeenCalled();
  });
});
