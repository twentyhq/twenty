import { useLingui } from '@lingui/react/macro';
import { type ReactElement, type ReactNode, useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AgentChatChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS } from '@/ai/constants/AgentChatChannelNavigationItems';
import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { type AgentChatChannelSummary } from '@/ai/types/AgentChatChannelSummary';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { getAgentChatChannelNavigationItemOrThrow } from '@/ai/utils/getAgentChatChannelNavigationItemOrThrow';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';
import { NavigationMenuItemFolderChevron } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderChevron';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';

type NavigationDrawerAiChatChannelNavigationProps = {
  channel: AgentChatChannel;
  summary?: AgentChatChannelSummary;
  channelView: AgentChatChannelView | null;
  isActive: boolean;
  isExpandable?: boolean;
  icon?: ReactElement;
  rightOptions?: ReactNode;
  isRightOptionsDropdownOpen?: boolean;
};

export const NavigationDrawerAiChatChannelNavigation = ({
  channel,
  summary,
  channelView,
  isActive,
  isExpandable = true,
  icon,
  rightOptions,
  isRightOptionsDropdownOpen,
}: NavigationDrawerAiChatChannelNavigationProps) => {
  const { t } = useLingui();
  const childrenId = useId();
  const { openAgentChatChannel } = useOpenAgentChatChannel();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();
  const channelViewKey = isDefined(channelView)
    ? getAgentChatChannelViewKey(channelView)
    : null;
  const [collapsedChannelViewKey, setCollapsedChannelViewKey] = useState<
    string | null
  >(null);

  if (
    isDefined(collapsedChannelViewKey) &&
    collapsedChannelViewKey !== channelViewKey
  ) {
    setCollapsedChannelViewKey(null);
  }

  const isChannelAccessible = channel.isAccessible ?? false;
  const isChannelExpandable = isChannelAccessible && isExpandable;
  const canShowChildren =
    isChannelExpandable && isNavigationDrawerContentExpanded;
  const areChildrenVisible =
    canShowChildren && isActive && collapsedChannelViewKey !== channelViewKey;
  const selectedItem =
    isActive && isDefined(channelView)
      ? getAgentChatChannelNavigationItemOrThrow(channelView)
      : undefined;
  const selectedIndex = AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.findIndex(
    (item) => item === selectedItem,
  );

  const handleClick = () => {
    if (!isActive) {
      setCollapsedChannelViewKey(null);
      openAgentChatChannel({ channelId: channel.id });

      return;
    }

    if (!canShowChildren && isDefined(channelView)) {
      openAgentChatChannel(channelView);

      return;
    }

    setCollapsedChannelViewKey(areChildrenVisible ? channelViewKey : null);
  };

  return (
    <NavigationDrawerItemGroup>
      <NavigationDrawerItem
        label={channel.name}
        secondaryLabel={isChannelAccessible ? undefined : t`Not open to you`}
        Icon={icon ?? <AgentChatChannelIcon channel={channel} />}
        variant={isChannelAccessible ? 'default' : 'tertiary'}
        isUnread={summary?.hasUnreadOpen}
        active={isActive && !areChildrenVisible}
        onClick={isChannelAccessible ? handleClick : undefined}
        triggerEvent="CLICK"
        preventCollapseOnMobile={canShowChildren}
        aria-expanded={canShowChildren ? areChildrenVisible : undefined}
        aria-controls={areChildrenVisible ? childrenId : undefined}
        trailingIcon={
          isChannelExpandable ? (
            <NavigationMenuItemFolderChevron isOpen={areChildrenVisible} />
          ) : undefined
        }
        rightOptions={rightOptions}
        isRightOptionsDropdownOpen={isRightOptionsDropdownOpen}
      />
      {areChildrenVisible && (
        <div id={childrenId}>
          {AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.map(
            (
              { channelStatus, assignment, label, Icon, countKey, unreadKey },
              index,
            ) => {
              const count = summary?.[countKey];

              return (
                <NavigationDrawerItem
                  key={`${channelStatus}-${assignment}`}
                  label={t(label)}
                  secondaryLabel={
                    isDefined(count) && count > 0 ? `${count}` : undefined
                  }
                  Icon={Icon}
                  isUnread={isDefined(unreadKey) ? summary?.[unreadKey] : false}
                  active={index === selectedIndex}
                  indentationLevel={2}
                  subItemIndentation="compact"
                  subItemState={getNavigationSubItemLeftAdornment({
                    index,
                    arrayLength: AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.length,
                    selectedIndex,
                  })}
                  onClick={() =>
                    openAgentChatChannel({
                      channelId: channel.id,
                      channelStatus,
                      assignment,
                    })
                  }
                  triggerEvent="CLICK"
                />
              );
            },
          )}
        </div>
      )}
    </NavigationDrawerItemGroup>
  );
};
