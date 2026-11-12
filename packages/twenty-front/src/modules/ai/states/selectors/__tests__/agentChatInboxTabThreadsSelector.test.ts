import { createStore } from 'jotai';
import {
  AGENT_CHAT_THREAD_FILTER_STATUS,
  type AgentChatThreadFilterStatus,
} from 'twenty-shared/ai';

import { agentChatInboxTabThreadListFamilyState } from '@/ai/states/agentChatInboxTabThreadListFamilyState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatInboxTabThreadsSelector } from '@/ai/states/selectors/agentChatInboxTabThreadsSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type AgentChatThreadParticipantFieldsFragment } from '~/generated-metadata/graphql';

const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';
const READ = {
  lastReadAt: LAST_ACTIVITY_AT,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  mentionsResolvedAt: null,
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
  {
    id: 'read',
    deletedAt: null,
    participant: {
      ...READ,
      archivedAt: null,
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'archived-then-active',
    deletedAt: null,
    lastActivityAt: ACTIVITY_AFTER_ARCHIVE_AT,
    participant: {
      ...READ,
      archivedAt: '2026-10-01T11:00:00.000Z',
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'snoozed-then-active',
    deletedAt: null,
    lastActivityAt: ACTIVITY_AFTER_ARCHIVE_AT,
    participant: {
      ...READ,
      archivedAt: '2026-10-01T11:00:00.000Z',
      snoozedUntil: '2026-10-02T09:00:00.000Z',
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'unread',
    deletedAt: null,
    participant: {
      ...READ,
      lastReadAt: null,
      archivedAt: null,
      __typename: 'AgentChatThreadParticipant',
    },
  },
  { id: 'not-followed', deletedAt: null, participant: undefined },
  {
    id: 'opened-not-followed',
    deletedAt: null,
    participant: {
      ...READ,
      archivedAt: null,
      isSubscribed: false,
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'snoozed',
    deletedAt: null,
    participant: {
      ...READ,
      archivedAt: '2026-10-01T11:00:00.000Z',
      snoozedUntil: '2026-10-02T09:00:00.000Z',
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'snooze-ended',
    deletedAt: null,
    participant: {
      ...READ,
      archivedAt: null,
      snoozedUntil: '2026-10-01T11:30:00.000Z',
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'archived',
    deletedAt: null,
    participant: {
      ...READ,
      archivedAt: '2026-10-01T11:00:00.000Z',
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'deleted',
    deletedAt: '2026-10-01T11:00:00.000Z',
    participant: {
      ...READ,
      archivedAt: null,
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'needs-input',
    deletedAt: null,
    pendingQuestionMessageId: 'question',
    participant: {
      ...READ,
      archivedAt: null,
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'done-needs-input',
    deletedAt: null,
    pendingQuestionMessageId: 'question',
    participant: {
      ...READ,
      archivedAt: '2026-10-01T11:00:00.000Z',
      __typename: 'AgentChatThreadParticipant',
    },
  },
  {
    id: 'mentioned',
    deletedAt: null,
    participant: {
      ...READ,
      archivedAt: null,
      lastMentionedAt: '2026-10-01T09:00:00.000Z',
      mentionsResolvedAt: null,
      __typename: 'AgentChatThreadParticipant',
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
      __typename: 'AgentChatThreadParticipant',
    },
  },
];

const getVisibleThreadIds = (filterStatus: AgentChatThreadFilterStatus) => {
  const store = createStore();

  setAgentChatThreadList(
    store,
    THREADS.map(
      ({ id, deletedAt, lastActivityAt, pendingQuestionMessageId }) => ({
        __typename: 'AgentChatThread',
        id,
        title: id,
        deletedAt,
        pendingQuestionMessageId: pendingQuestionMessageId ?? null,
        createdAt: LAST_ACTIVITY_AT,
        updatedAt: LAST_ACTIVITY_AT,
        lastActivityAt: lastActivityAt ?? LAST_ACTIVITY_AT,
      }),
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

  return store.get(agentChatInboxTabThreadsSelector.atom).map(({ id }) => id);
};

describe('agentChatInboxTabThreadsSelector', () => {
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

  it("lists the tab's loaded chats, and none older than its last page", () => {
    const store = createStore();
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
      createdAt: lastActivityAt,
      updatedAt: lastActivityAt,
      lastActivityAt,
    });
    const doneParticipant = (id: string) => ({
      ...READ,
      id,
      threadId: id,
      archivedAt: '2026-10-02T00:00:00.000Z',
      __typename: 'AgentChatThreadParticipant' as const,
    });

    setAgentChatThreadList(store, [
      buildThread({
        id: 'recent-done',
        lastActivityAt: '2026-10-01T10:00:00.000Z',
      }),
      buildThread({
        id: 'oldest-done',
        lastActivityAt: '2026-09-01T10:00:00.000Z',
      }),
    ]);
    store.set(
      recordStoreFamilyState.atomFamily('older-done'),
      buildThread({
        id: 'older-done',
        lastActivityAt: '2026-09-20T10:00:00.000Z',
      }),
    );
    store.set(recordStoreFamilyState.atomFamily('quiet-done'), {
      ...buildThread({
        id: 'quiet-done',
        lastActivityAt: '2026-10-05T10:00:00.000Z',
      }),
      lastActivityAt: null,
    });
    store.set(
      agentChatInboxTabThreadListFamilyState.atomFamily(
        AGENT_CHAT_THREAD_FILTER_STATUS.DONE,
      ),
      {
        threadIds: ['recent-done', 'older-done', 'quiet-done'],
        hasNextPage: true,
        endCursor: 'cursor',
        lastLoadedActivityAt: '2026-09-20T10:00:00.000Z',
      },
    );
    store.set(agentChatThreadParticipantsState.atom, {
      'recent-done': doneParticipant('recent-done'),
      'older-done': doneParticipant('older-done'),
      'oldest-done': doneParticipant('oldest-done'),
      'quiet-done': doneParticipant('quiet-done'),
    });
    store.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.DONE,
    );

    expect(
      store.get(agentChatInboxTabThreadsSelector.atom).map(({ id }) => id),
    ).toEqual(['recent-done', 'older-done', 'quiet-done']);
    expect(
      store.get(agentChatRecentThreadsSelector.atom).map(({ id }) => id),
    ).toEqual(['recent-done', 'oldest-done']);
  });
});
