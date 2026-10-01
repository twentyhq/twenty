import { createStore } from 'jotai';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER } from '@/ai/constants/AgentChatThreadLastActivityFilter';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const NOW = new Date('2026-10-01T12:00:00.000Z').getTime();
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';
const READ = { lastReadAt: LAST_ACTIVITY_AT, snoozedUntil: null };

const THREADS = [
  { id: 'read', deletedAt: null, participant: { ...READ, archivedAt: null } },
  { id: 'unread', deletedAt: null, participant: undefined },
  {
    id: 'snoozed',
    deletedAt: null,
    participant: {
      ...READ,
      archivedAt: '2026-10-01T11:00:00.000Z',
      snoozedUntil: '2026-10-02T09:00:00.000Z',
    },
  },
  {
    id: 'archived',
    deletedAt: null,
    participant: { ...READ, archivedAt: '2026-10-01T11:00:00.000Z' },
  },
  {
    id: 'deleted',
    deletedAt: '2026-10-01T11:00:00.000Z',
    participant: { ...READ, archivedAt: null },
  },
];

const getVisibleThreadIds = (filterStatus: AgentChatThreadFilterStatus) => {
  const store = createStore();

  for (const { id, deletedAt } of THREADS) {
    store.set(recordStoreFamilyState.atomFamily(id), {
      __typename: 'AgentChatThread',
      id,
      title: id,
      deletedAt,
      createdAt: LAST_ACTIVITY_AT,
      updatedAt: LAST_ACTIVITY_AT,
      lastActivityAt: LAST_ACTIVITY_AT,
    } as never);
  }
  store.set(agentChatThreadListState.atom, {
    threadIds: THREADS.map(({ id }) => id),
    hasNextPage: false,
    endCursor: null,
  });
  store.set(
    agentChatThreadParticipantsState.atom,
    Object.fromEntries(
      THREADS.filter(({ participant }) => participant !== undefined).map(
        ({ id, participant }) => [id, participant!],
      ),
    ),
  );
  store.set(agentChatThreadInboxNowState.atom, NOW);
  store.set(agentChatThreadFilterStatusState.atom, filterStatus);
  store.set(
    agentChatThreadLastActivityFilterState.atom,
    AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL,
  );

  return store.get(agentChatVisibleThreadsSelector.atom).map(({ id }) => id);
};

describe('agentChatVisibleThreadsSelector', () => {
  it.each([
    [AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE, ['read', 'unread']],
    [AGENT_CHAT_THREAD_FILTER_STATUS.UNREAD, ['unread']],
    [AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED, ['snoozed']],
    [AGENT_CHAT_THREAD_FILTER_STATUS.ARCHIVED, ['archived']],
    [AGENT_CHAT_THREAD_FILTER_STATUS.DELETED, ['deleted']],
    [
      AGENT_CHAT_THREAD_FILTER_STATUS.ALL,
      ['read', 'unread', 'snoozed', 'archived', 'deleted'],
    ],
  ])('lists the %s threads', (filterStatus, expectedThreadIds) => {
    expect(getVisibleThreadIds(filterStatus)).toEqual(expectedThreadIds);
  });
});
