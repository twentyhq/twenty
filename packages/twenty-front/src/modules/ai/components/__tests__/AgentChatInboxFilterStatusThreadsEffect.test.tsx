import { act, render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AgentChatInboxFilterStatusThreadsEffect } from '@/ai/components/AgentChatInboxFilterStatusThreadsEffect';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

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
            active: { threadIds: [], hasNextPage: false, endCursor: null },
          },
        },
  );

describe('AgentChatInboxFilterStatusThreadsEffect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // The channel view is kept in local storage
    localStorage.clear();
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

  it('leaves the tab unloaded while a channel is shown', async () => {
    jotaiStore.set(agentChatChannelViewState.atom, {
      channelId: 'sales',
      channelStatus: AgentChatChannelThreadStatus.OPEN,
      assignment: AgentChatChannelAssignmentFilter.ANY,
      filter: AgentChatChannelThreadFilter.ANY,
    });

    render(
      <JotaiProvider store={jotaiStore}>
        <AgentChatInboxFilterStatusThreadsEffect />
      </JotaiProvider>,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(60_000);
    });

    expect(refreshAgentChatThreadsInFilterStatus).not.toHaveBeenCalled();
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
