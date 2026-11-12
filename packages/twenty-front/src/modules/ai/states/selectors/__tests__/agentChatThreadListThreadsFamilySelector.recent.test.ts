import { createStore } from 'jotai';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { agentChatThreadListThreadsFamilySelector } from '@/ai/states/selectors/agentChatThreadListThreadsFamilySelector';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const buildThread = ({
  id,
  channelId,
}: {
  id: string;
  channelId: string | null;
}): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  deletedAt: null,
  channelId,
  createdAt: LAST_ACTIVITY_AT,
  updatedAt: LAST_ACTIVITY_AT,
  lastActivityAt: LAST_ACTIVITY_AT,
});

describe('agentChatThreadListThreadsFamilySelector for recent chats', () => {
  it('lists own chats and followed channel chats, not channel chats only read', () => {
    const store = createStore();

    setAgentChatThreadList(store, [
      buildThread({ id: 'own', channelId: null }),
      buildThread({ id: 'followed-channel-chat', channelId: 'channel' }),
      buildThread({ id: 'read-channel-chat', channelId: 'channel' }),
    ]);
    store.set(agentChatThreadParticipantsState.atom, {
      'followed-channel-chat': {
        __typename: 'AgentChatThreadParticipant' as const,
        id: 'participant',
        threadId: 'followed-channel-chat',
        lastReadAt: null,
        archivedAt: null,
        snoozedUntil: null,
        isSubscribed: true,
        lastMentionedAt: null,
        mentionsResolvedAt: null,
        updatedAt: LAST_ACTIVITY_AT,
      },
    });

    expect(
      store
        .get(
          agentChatThreadListThreadsFamilySelector.selectorFamily(
            AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
          ),
        )
        .map(({ id }) => id),
    ).toEqual(['own', 'followed-channel-chat']);
  });
});
