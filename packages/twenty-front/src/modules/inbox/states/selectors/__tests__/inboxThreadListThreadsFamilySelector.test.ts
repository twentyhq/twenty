import { createStore } from 'jotai';
import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';

import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { setInboxThreadList } from '@/inbox/testing/setInboxThreadList';
import { type InboxThreadListSource } from '@/inbox/types/InboxThreadListSource';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

const LAST_ACTIVITY_AT = '2026-10-01T10:00:00.000Z';

const CHANNEL_VIEW = {
  channelId: 'channel',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
  filter: AgentChatChannelThreadFilter.ANY,
};

const CHANNEL_SOURCE: InboxThreadListSource = {
  type: 'channel',
  channelView: CHANNEL_VIEW,
};

const buildThread = ({
  id,
  channelId = null,
  deletedAt = null,
  lastActivityAt = LAST_ACTIVITY_AT,
}: {
  id: string;
  channelId?: string | null;
  deletedAt?: string | null;
  lastActivityAt?: string;
}): AiChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  deletedAt,
  channelId,
  channelArchivedAt: null,
  channelSnoozedUntil: null,
  assigneeId: null,
  createdAt: lastActivityAt,
  updatedAt: lastActivityAt,
  lastActivityAt,
});

const buildFollowedParticipant = ({
  threadId,
  archivedAt = null,
}: {
  threadId: string;
  archivedAt?: string | null;
}) => ({
  __typename: 'AgentChatThreadParticipant' as const,
  id: `participant-${threadId}`,
  threadId,
  lastReadAt: LAST_ACTIVITY_AT,
  archivedAt,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  mentionsResolvedAt: null,
  updatedAt: LAST_ACTIVITY_AT,
});

const getThreadIds = ({
  store,
  source,
}: {
  store: ReturnType<typeof createStore>;
  source: InboxThreadListSource;
}) =>
  store
    .get(inboxThreadListThreadsFamilySelector.selectorFamily(source))
    .map(({ id }) => id);

describe('inboxThreadListThreadsFamilySelector', () => {
  it('lists own chats and followed channel chats as recent, not channel chats only read', () => {
    const store = createStore();

    setInboxThreadList(store, [
      buildThread({ id: 'own' }),
      buildThread({ id: 'followed-channel-chat', channelId: 'channel' }),
      buildThread({ id: 'read-channel-chat', channelId: 'channel' }),
    ]);
    store.set(aiChatThreadParticipantsState.atom, {
      isLoaded: true,
      rowsByThreadId: {
        'followed-channel-chat': buildFollowedParticipant({
          threadId: 'followed-channel-chat',
        }),
      },
    });

    expect(
      getThreadIds({ store, source: INBOX_RECENT_THREAD_LIST_SOURCE }),
    ).toEqual(['own', 'followed-channel-chat']);
  });

  it.each([
    [AGENT_CHAT_THREAD_PRESET_FILTER.OPEN, ['open']],
    [AGENT_CHAT_THREAD_PRESET_FILTER.DONE, ['archived']],
  ])(
    'lists the %s chats, leaving out deleted ones',
    (presetFilter, expectedThreadIds) => {
      const store = createStore();

      setInboxThreadList(store, [
        buildThread({ id: 'open' }),
        buildThread({ id: 'archived' }),
        buildThread({ id: 'deleted', deletedAt: LAST_ACTIVITY_AT }),
      ]);
      store.set(aiChatThreadParticipantsState.atom, {
        isLoaded: true,
        rowsByThreadId: {
          open: buildFollowedParticipant({ threadId: 'open' }),
          archived: buildFollowedParticipant({
            threadId: 'archived',
            archivedAt: '2026-10-01T11:00:00.000Z',
          }),
          deleted: buildFollowedParticipant({ threadId: 'deleted' }),
        },
      });

      expect(
        getThreadIds({ store, source: { type: 'presetFilter', presetFilter } }),
      ).toEqual(expectedThreadIds);
    },
  );

  it('keeps the chats of the channel pages loaded so far when the main list is refreshed', () => {
    const store = createStore();
    const recentThread = buildThread({
      id: 'recent',
      channelId: CHANNEL_VIEW.channelId,
      lastActivityAt: '2026-10-02T10:00:00.000Z',
    });
    const olderThread = buildThread({
      id: 'older',
      channelId: CHANNEL_VIEW.channelId,
      lastActivityAt: '2026-10-01T10:00:00.000Z',
    });

    store.set(recordStoreFamilyState.atomFamily('older'), olderThread);
    setInboxThreadList(store, [recentThread]);
    store.set(
      inboxThreadListFamilyState.atomFamily(
        getInboxThreadListSourceKey(CHANNEL_SOURCE),
      ),
      {
        threadIds: ['recent', 'older'],
        hasNextPage: true,
        endCursor: 'cursor',
        lastLoadedActivityAt: '2026-10-01T10:00:00.000Z',
      },
    );

    expect(getThreadIds({ store, source: CHANNEL_SOURCE })).toEqual([
      'recent',
      'older',
    ]);
  });
});
