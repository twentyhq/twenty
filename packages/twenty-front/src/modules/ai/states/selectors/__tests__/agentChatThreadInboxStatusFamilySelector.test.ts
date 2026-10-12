import { createStore } from 'jotai';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadVisitState } from '@/ai/states/agentChatThreadVisitState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';

const THREAD_ID = 'unread';
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const buildStore = () => {
  const store = createStore();

  setAgentChatThreadList(store, [
    {
      __typename: 'AgentChatThread',
      id: THREAD_ID,
      title: 'Unread',
      deletedAt: null,
      createdAt: LAST_ACTIVITY_AT,
      updatedAt: LAST_ACTIVITY_AT,
      lastActivityAt: LAST_ACTIVITY_AT,
    } as never,
  ]);

  return store;
};

const UNREAD_PARTICIPANT = {
  [THREAD_ID]: {
    id: 'participant',
    threadId: THREAD_ID,
    lastReadAt: null,
    archivedAt: null,
    snoozedUntil: null,
    isSubscribed: true,
    lastMentionedAt: null,
    updatedAt: LAST_ACTIVITY_AT,
  },
};

const isUnread = (store: ReturnType<typeof createStore>) =>
  store.get(agentChatThreadInboxStatusFamilySelector.selectorFamily(THREAD_ID))
    .isUnread;

describe('agentChatThreadInboxStatusFamilySelector', () => {
  it('reads a stored thread against the member state', () => {
    const store = buildStore();

    store.set(agentChatThreadParticipantsState.atom, UNREAD_PARTICIPANT);

    expect(isUnread(store)).toBe(true);
  });

  it('never reads as unread for a member who does not participate', () => {
    const store = buildStore();

    store.set(agentChatThreadParticipantsState.atom, {});

    expect(isUnread(store)).toBe(false);
  });

  it('never reads as unread before the member state loads', () => {
    expect(isUnread(buildStore())).toBe(false);
  });

  it('never reads the thread on screen as unread, unless the member kept it unread', () => {
    const store = buildStore();

    store.set(agentChatThreadParticipantsState.atom, UNREAD_PARTICIPANT);
    store.set(agentChatThreadVisitState.atom, {
      threadId: THREAD_ID,
      isUnread: true,
      lastReadAt: null,
      isKeptUnread: false,
    });

    expect(isUnread(store)).toBe(false);

    store.set(agentChatThreadVisitState.atom, {
      threadId: THREAD_ID,
      isUnread: true,
      lastReadAt: null,
      isKeptUnread: true,
    });

    expect(isUnread(store)).toBe(true);
  });
});
