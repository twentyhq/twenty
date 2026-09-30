import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { act, render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { AgentChatThreadInitializationEffect } from '@/ai/components/AgentChatThreadInitializationEffect';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';

const refreshAgentChatThreadsMock = jest.fn();

jest.mock('@/ai/hooks/useRefreshAgentChatThreads', () => ({
  useRefreshAgentChatThreads: () => ({
    refreshAgentChatThreads: refreshAgentChatThreadsMock,
  }),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => true,
}));

const buildStore = () => {
  const store = createStore();

  // The workspace is persisted in local storage, shared across stores
  store.set(currentWorkspaceState.atom, null);
  store.set(metadataStoreState.atomFamily('fieldMetadataItems'), {
    current: [],
    draft: [],
    status: 'up-to-date',
  });

  return store;
};

describe('AgentChatThreadInitializationEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retries when the initial thread request fails', async () => {
    refreshAgentChatThreadsMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([]);

    render(
      <JotaiProvider store={buildStore()}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: 'agent-chat-initialization-test' }}
        >
          <AgentChatThreadInitializationEffect />
        </AgentChatComponentInstanceContext.Provider>
      </JotaiProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(refreshAgentChatThreadsMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(refreshAgentChatThreadsMock).toHaveBeenCalledTimes(2);
  });
  it('waits for the chat fields before reading chats through the record API', async () => {
    const store = createStore();
    store.set(metadataStoreState.atomFamily('fieldMetadataItems'), {
      current: [],
      draft: [],
      status: 'empty',
    });

    render(
      <JotaiProvider store={store}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: 'agent-chat-initialization-test' }}
        >
          <AgentChatThreadInitializationEffect />
        </AgentChatComponentInstanceContext.Provider>
      </JotaiProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(refreshAgentChatThreadsMock).not.toHaveBeenCalled();
  });

  it('does not read chats in a suspended workspace, which the record API refuses', async () => {
    const store = buildStore();
    store.set(currentWorkspaceState.atom, {
      id: 'workspace-id',
      activationStatus: WorkspaceActivationStatus.SUSPENDED,
    } as CurrentWorkspace);

    render(
      <JotaiProvider store={store}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: 'agent-chat-initialization-test' }}
        >
          <AgentChatThreadInitializationEffect />
        </AgentChatComponentInstanceContext.Provider>
      </JotaiProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(refreshAgentChatThreadsMock).not.toHaveBeenCalled();
  });

  it('seeds an already-selected deep link when metadata arrives', async () => {
    refreshAgentChatThreadsMock.mockResolvedValue([]);
    const store = buildStore();
    const threadId = '9ebfd0b0-a703-4478-8859-9b01c2eef391';
    store.set(currentAiChatThreadState.atom, threadId);
    const usageAtom = agentChatUsageComponentFamilyState.atomFamily({
      instanceId: 'agent-chat-initialization-test',
      familyKey: { threadId },
    });
    render(
      <JotaiProvider store={store}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: 'agent-chat-initialization-test' }}
        >
          <AgentChatThreadInitializationEffect />
        </AgentChatComponentInstanceContext.Provider>
      </JotaiProvider>,
    );
    expect(store.get(usageAtom)).toBeNull();
    await act(async () => {
      setAgentChatThreadList(store, [
        {
          __typename: 'AgentChatThread',
          id: threadId,
          title: null,
          deletedAt: '2026-09-01',
          createdAt: '2026-08-01',
          updatedAt: '2026-09-01',
          conversationSize: 120,
          totalInputTokens: 250,
          totalOutputTokens: 30,
          totalCacheReadTokens: 80,
          contextWindowTokens: 1000,
          totalInputCredits: 125000,
          totalOutputCredits: 50000,
        },
      ]);
    });
    expect(store.get(usageAtom)).toMatchObject({
      inputTokens: 250,
      cachedInputTokens: 80,
      inputCredits: 0.125,
      lastMessage: null,
    });
    expect(store.get(currentAiChatThreadState.atom)).toBe(threadId);
  });
});
