import { createStore } from 'jotai';

import { agentChatThreadInboxNowState } from '@/ai/states/agentChatThreadInboxNowState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
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

describe('agentChatThreadInboxStatusFamilySelector', () => {
  it('returns the inbox status of a stored thread', () => {
    const store = buildStore({ hasLoadedParticipants: true });
    const getInboxStatus = (threadId: string) =>
      store.get(
        agentChatThreadInboxStatusFamilySelector.selectorFamily({
          threadId,
          lastActivityAt: null,
        }),
      );

    expect(getInboxStatus('read')).toEqual({
      scope: 'INBOX',
      isUnread: false,
      snoozedUntil: null,
    });
    expect(getInboxStatus('unread')).toEqual({
      scope: 'INBOX',
      isUnread: true,
      snoozedUntil: null,
    });
    expect(getInboxStatus('archived')).toEqual({
      scope: 'ARCHIVED',
      isUnread: false,
      snoozedUntil: null,
    });
    expect(getInboxStatus('snoozed')).toEqual({
      scope: 'SNOOZED',
      isUnread: false,
      snoozedUntil: '2026-10-02T09:00:00.000Z',
    });
  });

  it('never reads as unread before the participants load', () => {
    const store = buildStore({ hasLoadedParticipants: false });

    expect(
      store.get(
        agentChatThreadInboxStatusFamilySelector.selectorFamily({
          threadId: 'unread',
          lastActivityAt: null,
        }),
      ),
    ).toEqual({ scope: 'INBOX', isUnread: false, snoozedUntil: null });
  });
});
