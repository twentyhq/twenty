import { createStore } from 'jotai';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';

const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const buildThread = (id: string, channelId: string | null) =>
  ({
    __typename: 'AgentChatThread',
    id,
    title: id,
    deletedAt: null,
    channelId,
    createdAt: LAST_ACTIVITY_AT,
    updatedAt: LAST_ACTIVITY_AT,
    lastActivityAt: LAST_ACTIVITY_AT,
  }) as never;

describe('agentChatRecentThreadsSelector', () => {
  it('lists own chats and followed channel chats, not channel chats only read', () => {
    const store = createStore();

    setAgentChatThreadList(store, [
      buildThread('own', null),
      buildThread('followed-channel-chat', 'channel'),
      buildThread('read-channel-chat', 'channel'),
    ]);
    store.set(agentChatThreadParticipantsState.atom, {
      'followed-channel-chat': {
        id: 'participant',
        threadId: 'followed-channel-chat',
        lastReadAt: null,
        archivedAt: null,
        snoozedUntil: null,
        isSubscribed: true,
        lastMentionedAt: null,
        updatedAt: LAST_ACTIVITY_AT,
      },
    });

    expect(
      store.get(agentChatRecentThreadsSelector.atom).map(({ id }) => id),
    ).toEqual(['own', 'followed-channel-chat']);
  });
});
