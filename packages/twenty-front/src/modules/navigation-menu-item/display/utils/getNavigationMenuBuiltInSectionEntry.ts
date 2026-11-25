import { AGENT_CHAT_THREAD_PRESET_FILTER } from 'twenty-shared/ai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { type AiChatChannel } from '@/ai-chat/threads/types/AiChatChannel';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { sortAiChatThreadsByLastActivityDesc } from '@/ai-chat/threads/utils/sortAiChatThreadsByLastActivityDesc';
import { type InboxThreadListItemData } from '@/inbox/types/InboxThreadListItemData';
import { filterInboxRecentThreads } from '@/inbox/utils/filterInboxRecentThreads';
import { type NavigationMenuTabEntry } from '@/navigation-menu-item/common/types/NavigationMenuTabEntry';
import { getCoreAgentLink } from '@/object-core/agents/utils/getCoreAgentLink';
import { getSortedNonSystemAgents } from '@/object-core/agents/utils/getSortedNonSystemAgents';

export const getNavigationMenuBuiltInSectionEntry = ({
  builtInSectionKey,
  favoriteChannels,
  favoriteThreads,
  accessibleChannels,
  recentThreads,
  agents,
}: {
  builtInSectionKey: string;
  favoriteChannels: Pick<AiChatChannel, 'id'>[];
  favoriteThreads: InboxThreadListItemData[];
  accessibleChannels: Pick<AiChatChannel, 'id'>[];
  recentThreads: AiChatThreadRecord[];
  agents: { id: string; isSystem: boolean; label: string }[];
}): NavigationMenuTabEntry | null => {
  switch (builtInSectionKey) {
    case 'aiChatInbox':
      return {
        type: 'inboxPresetFilter',
        presetFilter: AGENT_CHAT_THREAD_PRESET_FILTER.OPEN,
      };
    case 'aiChatFavorites': {
      const [firstFavoriteChannel] = favoriteChannels;

      if (isDefined(firstFavoriteChannel)) {
        return { type: 'inboxChannel', channelId: firstFavoriteChannel.id };
      }

      const [firstFavoriteThread] = favoriteThreads;

      return isDefined(firstFavoriteThread)
        ? { type: 'aiChatThread', threadId: firstFavoriteThread.id }
        : null;
    }
    case 'aiChatChannels': {
      const [firstChannel] = accessibleChannels;

      return isDefined(firstChannel)
        ? { type: 'inboxChannel', channelId: firstChannel.id }
        : null;
    }
    case 'aiChatRecents': {
      const [firstRecentThread] = filterInboxRecentThreads({
        threads: sortAiChatThreadsByLastActivityDesc(recentThreads),
        favoriteThreads,
        shouldExcludeDirectMessages: false,
      });

      return isDefined(firstRecentThread)
        ? { type: 'aiChatThread', threadId: firstRecentThread.id }
        : null;
    }
    case 'aiAgents': {
      const [firstAgent] = getSortedNonSystemAgents(agents);

      return {
        type: 'link',
        link: isDefined(firstAgent)
          ? getCoreAgentLink(firstAgent.id)
          : getAppPath(AppPath.AgentIndexPage),
      };
    }
    default:
      return null;
  }
};
