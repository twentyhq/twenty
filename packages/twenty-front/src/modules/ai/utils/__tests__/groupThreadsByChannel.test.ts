import { groupThreadsByChannel } from '@/ai/utils/groupThreadsByChannel';
import {
  type AgentChatChannel,
  AgentChatChannelVisibility,
  type AgentChatThread,
} from '~/generated-metadata/graphql';

const buildChannel = (id: string, name: string): AgentChatChannel => ({
  __typename: 'AgentChatChannel',
  id,
  name,
  visibility: AgentChatChannelVisibility.PUBLIC,
  targetObjectMetadataId: null,
  targetRecordId: null,
  createdByUserWorkspaceId: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
});

const buildThread = (
  id: string,
  channelId: string | null,
): AgentChatThread => ({
  __typename: 'AgentChatThread',
  id,
  title: id,
  channelId,
  ownerUserWorkspaceId: 'owner',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  lastMessageAt: null,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCacheReadTokens: 0,
  conversationSize: 0,
  totalInputCredits: 0,
  totalOutputCredits: 0,
});

describe('groupThreadsByChannel', () => {
  it('groups threads under joined channels and keeps the rest as recents', () => {
    const sales = buildChannel('sales', 'Sales');

    const { channelGroups, threadsWithoutChannel } = groupThreadsByChannel({
      threads: [
        buildThread('a', 'sales'),
        buildThread('b', null),
        buildThread('c', 'not-joined'),
        buildThread('d', 'sales'),
      ],
      joinedChannels: [sales],
    });

    expect(channelGroups).toEqual([
      {
        channel: sales,
        threads: [buildThread('a', 'sales'), buildThread('d', 'sales')],
      },
    ]);
    expect(threadsWithoutChannel).toEqual([buildThread('b', null)]);
  });

  it('keeps an empty group for a joined channel without threads', () => {
    const leadership = buildChannel('leadership', 'Leadership');

    expect(
      groupThreadsByChannel({ threads: [], joinedChannels: [leadership] })
        .channelGroups,
    ).toEqual([{ channel: leadership, threads: [] }]);
  });
});
