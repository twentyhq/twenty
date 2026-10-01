import { createStore } from 'jotai';

import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { agentChatThreadInboxStatusesFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusesFamilySelector';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';

const NOW = new Date('2026-10-01T12:00:00.000Z').getTime();
const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const buildStore = ({
  hasLoadedParticipants,
}: {
  hasLoadedParticipants: boolean;
}) => {
  const store = createStore();

  setAgentChatThreadList(
    store,
    ['read', 'unread', 'archived', 'snoozed'].map(
      (id) =>
        ({
          __typename: 'AgentChatThread',
          id,
          title: id,
          deletedAt: null,
          createdAt: LAST_ACTIVITY_AT,
          updatedAt: LAST_ACTIVITY_AT,
          lastActivityAt: LAST_ACTIVITY_AT,
        }) as never,
    ),
  );
  store.set(agentChatThreadParticipantsState.atom, {
    read: {
      lastReadAt: LAST_ACTIVITY_AT,
      archivedAt: null,
      snoozedUntil: null,
    },
    archived: {
      lastReadAt: LAST_ACTIVITY_AT,
      archivedAt: '2026-10-01T11:00:00.000Z',
      snoozedUntil: null,
    },
    snoozed: {
      lastReadAt: LAST_ACTIVITY_AT,
      archivedAt: '2026-10-01T11:00:00.000Z',
      snoozedUntil: '2026-10-02T09:00:00.000Z',
    },
  });
  store.set(
    hasLoadedAgentChatThreadParticipantsState.atom,
    hasLoadedParticipants,
  );
  store.set(agentChatThreadInboxNowState.atom, NOW);

  return store;
};

describe('agentChatThreadInboxStatusesFamilySelector', () => {
  it('returns the inbox status of each requested thread', () => {
    const store = buildStore({ hasLoadedParticipants: true });

    expect(
      store.get(
        agentChatThreadInboxStatusesFamilySelector.selectorFamily([
          'read',
          'unread',
          'archived',
          'snoozed',
        ]),
      ),
    ).toEqual({
      read: { scope: 'INBOX', isUnread: false },
      unread: { scope: 'INBOX', isUnread: true },
      archived: { scope: 'ARCHIVED', isUnread: false },
      snoozed: { scope: 'SNOOZED', isUnread: false },
    });
  });

  it('returns no status before the participants load', () => {
    const store = buildStore({ hasLoadedParticipants: false });

    expect(
      store.get(
        agentChatThreadInboxStatusesFamilySelector.selectorFamily(['read']),
      ),
    ).toEqual({});
  });
});
