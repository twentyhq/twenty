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
});
