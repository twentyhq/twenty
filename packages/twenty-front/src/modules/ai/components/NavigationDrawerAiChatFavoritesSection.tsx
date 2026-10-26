import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

import { NavigationDrawerAiChatChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerSectionSeeMoreItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionSeeMoreItem';
import { useNavigationSectionVisibleItems } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSectionVisibleItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  type AgentChatChannel,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID = 'AiChatFavorites';

type FavoriteItem =
  | { type: 'channel'; channel: AgentChatChannel }
  | { type: 'thread'; thread: AgentChatThreadListItem };

type NavigationDrawerAiChatFavoritesSectionProps = {
  channels: AgentChatChannel[];
  threads: AgentChatThreadListItem[];
  currentThreadId: string | null;
  onThreadClick: (thread: AgentChatThreadListItem) => void;
  label?: string;
  rightIcon?: ReactNode;
  alwaysShowRightIcon?: boolean;
  isShownWhenEmpty?: boolean;
  visibleItemLimit?: number | null;
};

export const NavigationDrawerAiChatFavoritesSection = ({
  channels,
  threads,
  currentThreadId,
  onThreadClick,
  label,
  rightIcon,
  alwaysShowRightIcon,
  isShownWhenEmpty = false,
  visibleItemLimit,
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
  const {
    visibleItems,
    exceedsVisibleItemLimit,
    isShowingAllItems,
    toggleShowingAllItems,
  } = useNavigationSectionVisibleItems<FavoriteItem>({
    navigationSectionId: AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID,
    items: [
      ...channels.map((channel) => ({ type: 'channel' as const, channel })),
      ...threads.map((thread) => ({ type: 'thread' as const, thread })),
    ],
    visibleItemLimit,
  });

  if (!isShownWhenEmpty && channels.length === 0 && threads.length === 0) {
    return null;
  }

  return (
    <CollapsibleNavigationDrawerSection
      sectionId={AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID}
      label={label ?? t`Favorites`}
      rightIcon={rightIcon}
      alwaysShowRightIcon={alwaysShowRightIcon}
    >
      {visibleItems.map((favoriteItem) =>
        favoriteItem.type === 'channel' ? (
          <NavigationDrawerAiChatChannelItem
            key={favoriteItem.channel.id}
            channel={favoriteItem.channel}
            summary={agentChatChannelSummaries[favoriteItem.channel.id]}
            destinationChannels={agentChatAccessibleChannels.filter(
              ({ id }) => id !== favoriteItem.channel.id,
            )}
            canManage={canManageChannels}
          />
        ) : (
          <NavigationDrawerAiChatThreadItem
            key={favoriteItem.thread.id}
            thread={favoriteItem.thread}
            isActive={currentThreadId === favoriteItem.thread.id}
            onClick={onThreadClick}
          />
        ),
      )}
      {exceedsVisibleItemLimit && (
        <NavigationDrawerSectionSeeMoreItem
          isShowingAllItems={isShowingAllItems}
          onClick={toggleShowingAllItems}
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
