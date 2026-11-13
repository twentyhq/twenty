import { createStore } from 'jotai';

import { aiChatThreadParticipantsState } from '@/ai/states/aiChatThreadParticipantsState';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { setInboxThreadList } from '@/inbox/testing/setInboxThreadList';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';

const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const buildThread = ({
  id,
  channelId,
}: {
  id: string;
  channelId: string | null;
}): AiChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  deletedAt: null,
  channelId,
  createdAt: LAST_ACTIVITY_AT,
  updatedAt: LAST_ACTIVITY_AT,
  lastActivityAt: LAST_ACTIVITY_AT,
});

describe('inboxThreadListThreadsFamilySelector for recent chats', () => {
  it('lists own chats and followed channel chats, not channel chats only read', () => {
    const store = createStore();

    setInboxThreadList(store, [
      buildThread({ id: 'own', channelId: null }),
      buildThread({ id: 'followed-channel-chat', channelId: 'channel' }),
      buildThread({ id: 'read-channel-chat', channelId: 'channel' }),
    ]);
    store.set(aiChatThreadParticipantsState.atom, {
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
          inboxThreadListThreadsFamilySelector.selectorFamily(
            INBOX_RECENT_THREAD_LIST_SOURCE,
          ),
        )
        .map(({ id }) => id),
    ).toEqual(['own', 'followed-channel-chat']);
  });
});
