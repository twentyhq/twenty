import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';

import { NavigationDrawerAiChatChannelItem } from '@/ai/components/NavigationDrawerAiChatChannelItem';
import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatFavoritesNavigationSectionId';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
import { agentChatAccessibleChannelsSelector } from '@/ai/states/selectors/agentChatAccessibleChannelsSelector';
import { type AgentChatThreadListItem } from '@/ai/types/AgentChatThreadListItem';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { CollapsibleNavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/CollapsibleNavigationDrawerSection';
import { NavigationDrawerSectionSeeMoreItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionSeeMoreItem';
import { useNavigationSectionVisibleItems } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSectionVisibleItems';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';
import { PermissionFlagType } from '~/generated-metadata/graphql';

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
    isOverVisibleItemLimit,
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

  const visibleChannels = visibleItems.flatMap((favoriteItem) =>
    favoriteItem.type === 'channel' ? [favoriteItem.channel] : [],
  );
  const visibleThreads = visibleItems.flatMap((favoriteItem) =>
    favoriteItem.type === 'thread' ? [favoriteItem.thread] : [],
  );

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
      {visibleChannels.map((channel) => (
        <NavigationDrawerAiChatChannelItem
          key={channel.id}
          channel={channel}
          summary={agentChatChannelSummaries[channel.id]}
          destinationChannels={agentChatAccessibleChannels.filter(
            ({ id }) => id !== channel.id,
          )}
          canManage={canManageChannels}
          isExpandable={false}
        />
      ))}
      {visibleThreads.map((thread) => (
        <NavigationDrawerAiChatThreadItem
          key={thread.id}
          thread={thread}
          isActive={currentThreadId === thread.id}
          onClick={onThreadClick}
        />
      ))}
      {isOverVisibleItemLimit && (
        <NavigationDrawerSectionSeeMoreItem
          isShowingAllItems={isShowingAllItems}
          onClick={toggleShowingAllItems}
        />
      )}
    </CollapsibleNavigationDrawerSection>
  );
};
