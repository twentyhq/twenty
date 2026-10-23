import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AgentChatInboxFilterStatusThreadsEffect } from '@/ai/components/AgentChatInboxFilterStatusThreadsEffect';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const refreshAgentChatThreadsInFilterStatus = jest.fn();

jest.mock('@/ai/hooks/useRefreshAgentChatThreadsInFilterStatus', () => ({
  useRefreshAgentChatThreadsInFilterStatus: () => ({
    refreshAgentChatThreadsInFilterStatus,
  }),
}));

const loadActiveTabPage = () =>
  jotaiStore.set(agentChatThreadListState.atom, (list) =>
    list === null
      ? list
      : {
          ...list,
          filterStatusPages: {
            active: { hasNextPage: false, endCursor: null, totalCount: 0 },
          },
        },
  );

describe('AgentChatInboxFilterStatusThreadsEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetJotaiStore();
    refreshAgentChatThreadsInFilterStatus.mockReset();
    jotaiStore.set(agentChatThreadListState.atom, {
      threadIds: [],
      hasNextPage: false,
      endCursor: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retries the first page of the tab until it loads', async () => {
    refreshAgentChatThreadsInFilterStatus
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(async () => loadActiveTabPage());

    render(
      <JotaiProvider store={jotaiStore}>
        <AgentChatInboxFilterStatusThreadsEffect />
      </JotaiProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(refreshAgentChatThreadsInFilterStatus).toHaveBeenCalledTimes(1);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1_000);
    });

    expect(refreshAgentChatThreadsInFilterStatus).toHaveBeenCalledTimes(2);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(60_000);
    });

    expect(refreshAgentChatThreadsInFilterStatus).toHaveBeenCalledTimes(2);
  });

  it('stops retrying after a few failed attempts', async () => {
    refreshAgentChatThreadsInFilterStatus.mockResolvedValue(undefined);

    render(
      <JotaiProvider store={jotaiStore}>
        <AgentChatInboxFilterStatusThreadsEffect />
      </JotaiProvider>,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(10 * 60_000);
    });

    expect(refreshAgentChatThreadsInFilterStatus).toHaveBeenCalledTimes(5);
  });
});
