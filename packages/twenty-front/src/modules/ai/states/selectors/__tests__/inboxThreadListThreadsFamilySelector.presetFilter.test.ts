import { createStore } from 'jotai';
import {
  AGENT_CHAT_THREAD_PRESET_FILTER,
  type AgentChatThreadPresetFilter,
} from 'twenty-shared/ai';

import { setInboxThreadList } from '@/ai/testing/setInboxThreadList';
import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { inboxThreadListThreadsFamilySelector } from '@/ai/states/selectors/inboxThreadListThreadsFamilySelector';
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

const getVisibleThreadIds = (presetFilter: AgentChatThreadPresetFilter) => {
  const store = createStore();

  setInboxThreadList(
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
    aiChatThreadParticipantsState.atom,
    Object.fromEntries(
      THREADS.filter(({ participant }) => participant !== undefined).map(
        ({ id, participant }) => [id, { id, threadId: id, ...participant! }],
      ),
    ),
  );
  return store
    .get(
      inboxThreadListThreadsFamilySelector.selectorFamily({
        type: 'presetFilter',
        presetFilter,
      }),
    )
    .map(({ id }) => id);
};

describe('inboxThreadListThreadsFamilySelector for a preset filter', () => {
  it.each([
    [
      AGENT_CHAT_THREAD_PRESET_FILTER.OPEN,
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
    [AGENT_CHAT_THREAD_PRESET_FILTER.NEEDS_INPUT, ['needs-input']],
    [AGENT_CHAT_THREAD_PRESET_FILTER.MENTIONS, ['mentioned']],
    [AGENT_CHAT_THREAD_PRESET_FILTER.SNOOZED, ['snoozed']],
    [
      AGENT_CHAT_THREAD_PRESET_FILTER.DONE,
      ['archived', 'done-needs-input', 'unsubscribed-then-active'],
    ],
  ])('lists the %s threads', (presetFilter, expectedThreadIds) => {
    expect(getVisibleThreadIds(presetFilter)).toEqual(expectedThreadIds);
  });
});
