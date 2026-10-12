import { useLingui } from '@lingui/react/macro';

import { NavigationDrawerAiChatChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatFavoriteChannelsSelector } from '@/ai/states/selectors/agentChatFavoriteChannelsSelector';
import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID = 'AiChatFavorites';

type NavigationDrawerAiChatFavoritesSectionProps = {
  threads: AgentChatThreadListItem[];
  currentThreadId: string | null;
  onThreadClick: (thread: AgentChatThreadListItem) => void;
};

export const NavigationDrawerAiChatFavoritesSection = ({
  threads,
  currentThreadId,
  onThreadClick,
}: NavigationDrawerAiChatFavoritesSectionProps) => {
  const { t } = useLingui();
  const favoriteChannels = useAtomStateValue(agentChatFavoriteChannelsSelector);
  const agentChatChannels = useAtomStateValue(agentChatChannelsState);
  const agentChatChannelSummaries = useAtomStateValue(
    agentChatChannelSummariesState,
  );
  const canManageChannels = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );

  if (favoriteChannels.length === 0 && threads.length === 0) {
    return null;
  }

  const accessibleChannels = (agentChatChannels ?? []).filter(
    ({ isAccessible }) => isAccessible,
  );

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID}
      label={t`Favorites`}
    >
      {favoriteChannels.map((channel) => (
        <NavigationDrawerAiChatChannelItem
          key={channel.id}
          channel={channel}
          summary={agentChatChannelSummaries[channel.id]}
          destinationChannels={accessibleChannels.filter(
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
