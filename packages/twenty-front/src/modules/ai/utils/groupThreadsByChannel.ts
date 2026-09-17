import { isDefined } from 'twenty-shared/utils';

import { type FlatAgentChatChannel } from '@/metadata-store/types/FlatAgentChatChannel';
import { type AgentChatThread } from '~/generated-metadata/graphql';

export type AgentChatThreadChannelGroup = {
  channel: FlatAgentChatChannel;
  threads: AgentChatThread[];
};

// Threads in a channel the user has not joined stay out of the sidebar: they
// are reachable through the channel browser, not the recents list.
export const groupThreadsByChannel = ({
  threads,
  joinedChannels,
}: {
  threads: AgentChatThread[];
  joinedChannels: FlatAgentChatChannel[];
}): {
  channelGroups: AgentChatThreadChannelGroup[];
  threadsWithoutChannel: AgentChatThread[];
} => {
  const threadsByChannelId = new Map<string, AgentChatThread[]>();
  const threadsWithoutChannel: AgentChatThread[] = [];

  for (const thread of threads) {
    if (!isDefined(thread.channelId)) {
      threadsWithoutChannel.push(thread);
      continue;
    }

    threadsByChannelId.set(thread.channelId, [
      ...(threadsByChannelId.get(thread.channelId) ?? []),
      thread,
    ]);
  }

  return {
    channelGroups: joinedChannels.map((channel) => ({
      channel,
      threads: threadsByChannelId.get(channel.id) ?? [],
    })),
    threadsWithoutChannel,
  };
};
