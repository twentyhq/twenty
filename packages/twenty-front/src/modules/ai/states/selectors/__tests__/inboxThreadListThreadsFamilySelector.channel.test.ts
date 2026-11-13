import { createStore } from 'jotai';

import { inboxThreadListFamilyState } from '@/ai/states/inboxThreadListFamilyState';
import { inboxThreadListThreadsFamilySelector } from '@/ai/states/selectors/inboxThreadListThreadsFamilySelector';
import { getInboxThreadListSourceKey } from '@/ai/utils/getInboxThreadListSourceKey';
import { setInboxThreadList } from '@/ai/testing/setInboxThreadList';
import { type InboxThreadListSource } from '@/ai/types/InboxThreadListSource';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

const CHANNEL_VIEW = {
  channelId: 'channel',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
  filter: AgentChatChannelThreadFilter.ANY,
};

const buildThread = ({
  id,
  lastActivityAt,
}: {
  id: string;
  lastActivityAt: string;
}): AiChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  deletedAt: null,
  channelId: CHANNEL_VIEW.channelId,
  channelArchivedAt: null,
  channelSnoozedUntil: null,
  assigneeId: null,
  createdAt: lastActivityAt,
  updatedAt: lastActivityAt,
  lastActivityAt,
});

const CHANNEL_SOURCE: InboxThreadListSource = {
  type: 'channel',
  channelView: CHANNEL_VIEW,
};

describe('inboxThreadListThreadsFamilySelector for a channel view', () => {
  it('keeps the chats of the channel pages loaded so far when the main list is refreshed', () => {
    const store = createStore();
    const recentThread = buildThread({
      id: 'recent',
      lastActivityAt: '2026-10-02T10:00:00.000Z',
    });
    const olderThread = buildThread({
      id: 'older',
      lastActivityAt: '2026-10-01T10:00:00.000Z',
    });

    store.set(recordStoreFamilyState.atomFamily('older'), olderThread);
    // A refresh replaced the main list with its first page
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

    expect(
      store
        .get(
          inboxThreadListThreadsFamilySelector.selectorFamily(CHANNEL_SOURCE),
        )
        .map(({ id }) => id),
    ).toEqual(['recent', 'older']);
  });
});
