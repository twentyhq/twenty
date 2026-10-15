import { useLingui } from '@lingui/react/macro';

import { NavigationDrawerAiChatChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type AgentChatChannel,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID = 'AiChatFavorites';

type NavigationDrawerAiChatFavoritesSectionProps = {
  channels: AgentChatChannel[];
  threads: AgentChatThreadListItem[];
  currentThreadId: string | null;
  onThreadClick: (thread: AgentChatThreadListItem) => void;
};

export const NavigationDrawerAiChatFavoritesSection = ({
  channels,
  threads,
  currentThreadId,
  onThreadClick,
}: NavigationDrawerAiChatFavoritesSectionProps) => {
  const { t } = useLingui();
  const agentChatAccessibleChannels = useAtomStateValue(
    agentChatAccessibleChannelsSelector,
  );
  const agentChatChannelSummaries = useAtomStateValue(
    agentChatChannelSummariesState,
  );
  const canManageChannels = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );

  if (channels.length === 0 && threads.length === 0) {
    return null;
  }

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID}
      label={t`Favorites`}
    >
      {channels.map((channel) => (
        <NavigationDrawerAiChatChannelItem
          key={channel.id}
          channel={channel}
          summary={agentChatChannelSummaries[channel.id]}
          destinationChannels={agentChatAccessibleChannels.filter(
            ({ id }) => id !== channel.id,
          )}
          canManage={canManageChannels}
        />
      ))}
      {threads.map((thread) => (
        <NavigationDrawerAiChatThreadItem
          key={thread.id}
          thread={thread}
          isActive={currentThreadId === thread.id}
          onClick={onThreadClick}
        />
      ))}
    </CollapsibleNavigationDrawerSection>
  );
};
