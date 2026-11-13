import { createStore } from 'jotai';

import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { aiChatThreadVisitState } from '@/ai/states/aiChatThreadVisitState';
import { inboxThreadMemberStateFamilySelector } from '@/ai/states/selectors/inboxThreadMemberStateFamilySelector';
import { setInboxThreadList } from '@/ai/testing/setInboxThreadList';

const THREAD_ID = 'unread';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const buildStore = () => {
  const store = createStore();

  setInboxThreadList(store, [
    {
      __typename: 'AgentChatThread',
      id: THREAD_ID,
      title: 'Unread',
      deletedAt: null,
      createdAt: LAST_ACTIVITY_AT,
      updatedAt: LAST_ACTIVITY_AT,
      lastActivityAt: LAST_ACTIVITY_AT,
    },
  ]);

  return store;
};

const UNREAD_PARTICIPANT = {
  [THREAD_ID]: {
    __typename: 'AgentChatThreadParticipant' as const,
    id: 'participant',
    threadId: THREAD_ID,
    lastReadAt: null,
    archivedAt: null,
    snoozedUntil: null,
    isSubscribed: true,
    lastMentionedAt: null,
    mentionsResolvedAt: null,
    updatedAt: LAST_ACTIVITY_AT,
  },
};

const isUnread = (store: ReturnType<typeof createStore>) =>
  store.get(inboxThreadMemberStateFamilySelector.selectorFamily(THREAD_ID))
    .isUnread;

describe('inboxThreadMemberStateFamilySelector', () => {
  it('reads a stored thread against the member state', () => {
    const store = buildStore();

    store.set(aiChatThreadParticipantsState.atom, UNREAD_PARTICIPANT);

    expect(isUnread(store)).toBe(true);
  });

  it('never reads as unread for a member who does not participate', () => {
    const store = buildStore();

    store.set(aiChatThreadParticipantsState.atom, {});

    expect(isUnread(store)).toBe(false);
  });

  it('never reads as unread before the member state loads', () => {
    expect(isUnread(buildStore())).toBe(false);
  });

  it('never reads the thread on screen as unread, unless the member kept it unread', () => {
    const store = buildStore();

    store.set(aiChatThreadParticipantsState.atom, UNREAD_PARTICIPANT);
    store.set(aiChatThreadVisitState.atom, {
      threadId: THREAD_ID,
      isUnread: true,
      lastReadAt: null,
      isKeptUnread: false,
    });

    expect(isUnread(store)).toBe(false);

    store.set(aiChatThreadVisitState.atom, {
      threadId: THREAD_ID,
      isUnread: true,
      lastReadAt: null,
      isKeptUnread: true,
    });

    expect(isUnread(store)).toBe(true);
  });
});
