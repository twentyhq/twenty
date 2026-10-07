import { createStore } from 'jotai';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { type AgentChatThreadFilterStatus } from '@/ai/types/AgentChatThreadFilterStatus';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';
const READ = {
  lastReadAt: LAST_ACTIVITY_AT,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  updatedAt: LAST_ACTIVITY_AT,
};

const ACTIVITY_AFTER_ARCHIVE_AT = '2026-10-01T11:30:00.000Z';

const THREADS: {
  id: string;
  deletedAt: string | null;
  lastActivityAt?: string;
  pendingQuestionMessageId?: string;
  participant:
    | Omit<AgentChatThreadParticipantFieldsFragment, 'id' | 'threadId'>
    | undefined;
}[] = [
  { id: 'read', deletedAt: null, participant: { ...READ, archivedAt: null } },
  {
    id: 'archived-then-active',
    deletedAt: null,
    lastActivityAt: ACTIVITY_AFTER_ARCHIVE_AT,
    participant: { ...READ, archivedAt: '2026-10-01T11:00:00.000Z' },
  },
  {
    id: 'snoozed-then-active',
    deletedAt: null,
    lastActivityAt: ACTIVITY_AFTER_ARCHIVE_AT,
    participant: {
      ...READ,
      archivedAt: '2026-10-01T11:00:00.000Z',
      snoozedUntil: '2026-10-02T09:00:00.000Z',
    },
  },
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
    id: 'snooze-ended',
    deletedAt: null,
    participant: {
      ...READ,
      archivedAt: null,
      snoozedUntil: '2026-10-01T11:30:00.000Z',
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
  {
    id: 'needs-input',
    deletedAt: null,
    pendingQuestionMessageId: 'question',
    participant: { ...READ, archivedAt: null },
  },
  {
    id: 'done-needs-input',
    deletedAt: null,
    pendingQuestionMessageId: 'question',
    participant: { ...READ, archivedAt: '2026-10-01T11:00:00.000Z' },
  },
  {
    id: 'mentioned',
    deletedAt: null,
    participant: {
      ...READ,
      archivedAt: null,
      lastMentionedAt: '2026-10-01T09:00:00.000Z',
    },
  },
  {
    id: 'unsubscribed-then-active',
    deletedAt: null,
    lastActivityAt: ACTIVITY_AFTER_ARCHIVE_AT,
    participant: {
      ...READ,
      archivedAt: '2026-10-01T11:00:00.000Z',
      isSubscribed: false,
    },
  },
];

const getVisibleThreadIds = (filterStatus: AgentChatThreadFilterStatus) => {
  const store = createStore();

  setAgentChatThreadList(
    store,
    THREADS.map(
      ({ id, deletedAt, lastActivityAt, pendingQuestionMessageId }) =>
        ({
          __typename: 'AgentChatThread',
          id,
          title: id,
          deletedAt,
          pendingQuestionMessageId: pendingQuestionMessageId ?? null,
          createdAt: LAST_ACTIVITY_AT,
          updatedAt: LAST_ACTIVITY_AT,
          lastActivityAt: lastActivityAt ?? LAST_ACTIVITY_AT,
        }) as never,
    ),
  );
  store.set(
    agentChatThreadParticipantsState.atom,
    Object.fromEntries(
      THREADS.filter(({ participant }) => participant !== undefined).map(
        ({ id, participant }) => [id, { id, threadId: id, ...participant! }],
      ),
    ),
  );
  store.set(agentChatThreadFilterStatusState.atom, filterStatus);

  return store.get(agentChatVisibleThreadsSelector.atom).map(({ id }) => id);
};

describe('agentChatVisibleThreadsSelector', () => {
  it.each([
    [
      AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
      [
        'read',
        'archived-then-active',
        'snoozed-then-active',
        'unread',
        'snooze-ended',
        'needs-input',
        'mentioned',
      ],
    ],
    [AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT, ['needs-input']],
    [AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS, ['mentioned']],
    [AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED, ['snoozed']],
    [
      AGENT_CHAT_THREAD_FILTER_STATUS.DONE,
      ['archived', 'done-needs-input', 'unsubscribed-then-active'],
    ],
  ])('lists the %s threads', (filterStatus, expectedThreadIds) => {
    expect(getVisibleThreadIds(filterStatus)).toEqual(expectedThreadIds);
  });
});
