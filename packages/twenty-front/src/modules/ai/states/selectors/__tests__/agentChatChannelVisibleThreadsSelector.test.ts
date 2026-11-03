import { createStore } from 'jotai';

import { agentChatChannelThreadListState } from '@/ai/states/agentChatChannelThreadListState';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatChannelVisibleThreadsSelector } from '@/ai/states/selectors/agentChatChannelVisibleThreadsSelector';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

const CHANNEL_VIEW = {
  channelId: 'channel',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
  filter: AgentChatChannelThreadFilter.ANY,
};

const buildThread = ({
  id,
  lastActivityAt,
}: {
  id: string;
  lastActivityAt: string;
}): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  deletedAt: null,
  channelId: CHANNEL_VIEW.channelId,
  channelArchivedAt: null,
  channelSnoozedUntil: null,
  assigneeId: null,
  createdAt: lastActivityAt,
  updatedAt: lastActivityAt,
  lastActivityAt,
});

describe('agentChatChannelVisibleThreadsSelector', () => {
  it('keeps the chats of the channel pages loaded so far when the main list is refreshed', () => {
    const store = createStore();
    const recentThread = buildThread({
      id: 'recent',
      lastActivityAt: '2026-10-02T10:00:00.000Z',
    });
    const olderThread = buildThread({
      id: 'older',
      lastActivityAt: '2026-10-01T10:00:00.000Z',
    });

    store.set(agentChatChannelViewState.atom, CHANNEL_VIEW);
    store.set(recordStoreFamilyState.atomFamily('older'), olderThread);
    // A refresh replaced the main list with its first page
    setAgentChatThreadList(store, [recentThread]);
    store.set(agentChatChannelThreadListState.atom, {
      viewKey: getAgentChatChannelViewKey(CHANNEL_VIEW),
      threadIds: ['recent', 'older'],
      hasNextPage: true,
      endCursor: 'cursor',
      lastLoadedSortAt: '2026-10-01T10:00:00.000Z',
      lastLoadedThreadId: 'older',
    });

    expect(
      store
        .get(agentChatChannelVisibleThreadsSelector.atom)
        .map(({ id }) => id),
    ).toEqual(['recent', 'older']);
  });

  it('keeps the snoozed page boundary on wake dates despite newer activity', () => {
    const store = createStore();
    const snoozedView = {
      ...CHANNEL_VIEW,
      channelStatus: AgentChatChannelThreadStatus.SNOOZED,
    };
    const threads = [
      {
        ...buildThread({
          id: 'later-page',
          lastActivityAt: '2026-11-03T12:00:00.000Z',
        }),
        channelArchivedAt: '2026-11-03T10:00:00.000Z',
        channelSnoozedUntil: '2026-11-06T09:00:00.000Z',
      },
      {
        ...buildThread({
          id: 'loaded',
          lastActivityAt: '2026-11-03T11:00:00.000Z',
        }),
        channelArchivedAt: '2026-11-03T10:00:00.000Z',
        channelSnoozedUntil: '2026-11-05T09:00:00.000Z',
      },
      {
        ...buildThread({
          id: 'sooner',
          lastActivityAt: '2026-11-01T09:00:00.000Z',
        }),
        channelArchivedAt: '2026-11-03T10:00:00.000Z',
        channelSnoozedUntil: '2026-11-04T09:00:00.000Z',
      },
    ];

    threads.push(
      ...['alpha', 'zulu'].map((id) => ({
        ...buildThread({ id, lastActivityAt: '2026-11-03T09:00:00.000Z' }),
        channelArchivedAt: '2026-11-03T10:00:00.000Z',
        channelSnoozedUntil: '2026-11-05T09:00:00.000Z',
      })),
    );

    store.set(agentChatChannelViewState.atom, snoozedView);
    setAgentChatThreadList(store, threads);
    store.set(agentChatChannelThreadListState.atom, {
      viewKey: getAgentChatChannelViewKey(snoozedView),
      threadIds: ['loaded'],
      hasNextPage: true,
      endCursor: 'cursor',
      lastLoadedSortAt: '2026-11-05T09:00:00.000Z',
      lastLoadedThreadId: 'loaded',
    });

    expect(
      store
        .get(agentChatChannelVisibleThreadsSelector.atom)
        .map(({ id }) => id),
    ).toEqual(['loaded', 'sooner', 'zulu']);
  });
});
