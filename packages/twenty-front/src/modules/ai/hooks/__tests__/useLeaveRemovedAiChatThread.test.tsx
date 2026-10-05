import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useLeaveRemovedAiChatThread } from '@/ai/hooks/useLeaveRemovedAiChatThread';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputIsEmptySelector } from '@/ai/states/selectors/agentChatInputIsEmptySelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const projectAiChatThreadToUrl = jest.fn();
const loadAgentChatThread = jest.fn();

jest.mock('@/ai/hooks/useProjectAiChatThreadToUrl', () => ({
  useProjectAiChatThreadToUrl: () => ({ projectAiChatThreadToUrl }),
}));

jest.mock('@/ai/hooks/useRefreshAgentChatThreads', () => ({
  useRefreshAgentChatThreads: () => ({ loadAgentChatThread }),
}));

const REMOVED_CHAT_ID = '20202020-0000-4000-8000-0000000000aa';
const OLDER_CHAT_ID = '20202020-0000-4000-8000-0000000000bb';
const RECENT_CHAT_ID = '20202020-0000-4000-8000-0000000000cc';

const buildChat = (id: string, updatedAt: string): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  updatedAt,
  createdAt: updatedAt,
  deletedAt: null,
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
    loadAgentChatThread.mockResolvedValue(null);
    jotaiStore.set(currentAiChatThreadState.atom, REMOVED_CHAT_ID);
  });

  it('moves to the most recent chat with its draft when the current one is gone', async () => {
    setAgentChatThreadList(jotaiStore, [
      buildChat(OLDER_CHAT_ID, '2026-09-01T00:00:00.000Z'),
      buildChat(RECENT_CHAT_ID, '2026-09-20T00:00:00.000Z'),
    ]);
    jotaiStore.set(agentChatDraftsByThreadIdState.atom, {
      [RECENT_CHAT_ID]: 'Pending question',
    });

    await leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(RECENT_CHAT_ID);
    expect(jotaiStore.get(agentChatInputIsEmptySelector.atom)).toBe(false);
    expect(projectAiChatThreadToUrl).toHaveBeenCalledWith(RECENT_CHAT_ID);
  });

  it('opens a new chat when no chat is left', async () => {
    setAgentChatThreadList(jotaiStore, []);

    await leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    );
  });

  it('stays on a chat that is still listed', async () => {
    setAgentChatThreadList(jotaiStore, [
      buildChat(REMOVED_CHAT_ID, '2026-09-01T00:00:00.000Z'),
    ]);

    await leave();

    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(REMOVED_CHAT_ID);
    expect(loadAgentChatThread).not.toHaveBeenCalled();
    expect(projectAiChatThreadToUrl).not.toHaveBeenCalled();
  });

  it('stays on an older chat that exists past the loaded pages', async () => {
    setAgentChatThreadList(jotaiStore, [
      buildChat(RECENT_CHAT_ID, '2026-09-20T00:00:00.000Z'),
    ]);
    loadAgentChatThread.mockResolvedValue(
      buildChat(REMOVED_CHAT_ID, '2025-01-01T00:00:00.000Z'),
    );

    await leave();

    expect(loadAgentChatThread).toHaveBeenCalledWith(REMOVED_CHAT_ID);
    expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(REMOVED_CHAT_ID);
    expect(projectAiChatThreadToUrl).not.toHaveBeenCalled();
  });
});
