import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type AgentChatThread } from '~/generated-metadata/graphql';
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
      <JotaiProvider store={createStore()}>
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
  it('seeds an already-selected deep link when metadata arrives', async () => {
    refreshAgentChatThreadsMock.mockResolvedValue([]);
    const store = createStore();
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
    const metadataAtom = metadataStoreState.atomFamily('agentChatThreads');
    await act(async () => {
      store.set(metadataAtom, {
        ...store.get(metadataAtom),
        status: 'up-to-date',
        current: [
          {
            id: threadId,
            deletedAt: '2026-09-01',
            createdAt: '2026-08-01',
            updatedAt: '2026-09-01',
            conversationSize: 120,
            canManage: true,
            totalInputTokens: 250,
            totalOutputTokens: 30,
            totalCacheReadTokens: 80,
            contextWindowTokens: 1000,
            totalInputCredits: 0.125,
            totalOutputCredits: 0.05,
          } satisfies AgentChatThread,
        ],
      });
    });
    expect(store.get(usageAtom)).toMatchObject({
      inputTokens: 250,
      cachedInputTokens: 80,
      lastMessage: null,
    });
    expect(store.get(currentAiChatThreadState.atom)).toBe(threadId);
  });
});
