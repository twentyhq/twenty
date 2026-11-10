import { createStore } from 'jotai';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatDirectMessageSidebarItemsSelector } from '@/ai/states/selectors/agentChatDirectMessageSidebarItemsSelector';
import { setAgentChatThreadList } from '@/ai/testing/setAgentChatThreadList';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';

const CURRENT_MEMBER_ID = mockedWorkspaceMemberData.id;
const PEER_MEMBER_ID = 'peer-member';
const FORMER_MEMBER_ID = 'former-member';

const buildThread = ({
  id,
  lastActivityAt,
  conversationType,
  peerWorkspaceMemberId = null,
  deletedAt = null,
}: {
  id: string;
  lastActivityAt: string;
  conversationType: AgentChatThreadConversationType;
  peerWorkspaceMemberId?: string | null;
  deletedAt?: string | null;
}): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  conversationType,
  directMessageFirstWorkspaceMemberId: CURRENT_MEMBER_ID,
  directMessageSecondWorkspaceMemberId: peerWorkspaceMemberId,
  deletedAt,
  channelId: null,
  createdAt: lastActivityAt,
  updatedAt: lastActivityAt,
  lastActivityAt,
});

const setUpStore = (threads: AgentChatThreadRecord[]) => {
  const store = createStore();

  setAgentChatThreadList(store, threads);
  store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
  store.set(currentWorkspaceMembersState.atom, [
    mockedWorkspaceMemberData,
    {
      ...mockedWorkspaceMemberData,
      id: PEER_MEMBER_ID,
      name: { firstName: 'Alice', lastName: 'Example' },
      userEmail: 'alice@example.com',
    },
  ]);

  return store;
};

describe('agentChatDirectMessageSidebarItemsSelector', () => {
  it('lists open direct messages, newest first, with the other member', () => {
    const store = setUpStore([
      buildThread({
        id: 'older-dm',
        lastActivityAt: '2026-11-01T10:00:00.000Z',
        conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
        peerWorkspaceMemberId: PEER_MEMBER_ID,
      }),
      buildThread({
        id: 'chat',
        lastActivityAt: '2026-11-03T10:00:00.000Z',
        conversationType: AgentChatThreadConversationType.STANDARD,
      }),
      buildThread({
        id: 'deleted-dm',
        lastActivityAt: '2026-11-04T10:00:00.000Z',
        conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
        peerWorkspaceMemberId: PEER_MEMBER_ID,
        deletedAt: '2026-11-05T10:00:00.000Z',
      }),
      buildThread({
        id: 'former-member-dm',
        lastActivityAt: '2026-11-02T10:00:00.000Z',
        conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
        peerWorkspaceMemberId: FORMER_MEMBER_ID,
      }),
    ]);

    expect(store.get(agentChatDirectMessageSidebarItemsSelector.atom)).toEqual([
      { threadId: 'former-member-dm', peer: null, isUnread: false },
      {
        threadId: 'older-dm',
        peer: {
          workspaceMemberId: PEER_MEMBER_ID,
          name: 'Alice Example',
          avatarUrl: mockedWorkspaceMemberData.avatarUrl,
          email: 'alice@example.com',
        },
        isUnread: false,
      },
    ]);
  });

  it('marks a direct message unread when it has activity since the last read', () => {
    const store = setUpStore([
      buildThread({
        id: 'unread-dm',
        lastActivityAt: '2026-11-02T10:00:00.000Z',
        conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
        peerWorkspaceMemberId: PEER_MEMBER_ID,
      }),
    ]);
    store.set(agentChatThreadParticipantsState.atom, {
      'unread-dm': {
        __typename: 'AgentChatThreadParticipant' as const,
        id: 'participant',
        threadId: 'unread-dm',
        lastReadAt: '2026-11-01T10:00:00.000Z',
        archivedAt: null,
        snoozedUntil: null,
        isSubscribed: true,
        lastMentionedAt: null,
        mentionsResolvedAt: null,
        updatedAt: '2026-11-01T10:00:00.000Z',
      },
    });

    expect(
      store
        .get(agentChatDirectMessageSidebarItemsSelector.atom)
        .map(({ threadId, isUnread }) => ({ threadId, isUnread })),
    ).toEqual([{ threadId: 'unread-dm', isUnread: true }]);
  });
});
