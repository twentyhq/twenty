import { useLingui } from '@lingui/react/macro';
import { type ReactElement, type ReactNode, useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { AgentChatChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS } from '@/ai/constants/AgentChatChannelNavigationItems';
import { useOpenAgentChatChannel } from '@/ai/hooks/useOpenAgentChatChannel';
import { type AgentChatChannelSummary } from '@/ai/types/AgentChatChannelSummary';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { getAgentChatChannelNavigationItem } from '@/ai/utils/getAgentChatChannelNavigationItem';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { type AgentChatChannel } from '~/generated-metadata/graphql';

type NavigationDrawerAiChatChannelNavigationProps = {
  channel: AgentChatChannel;
  summary?: AgentChatChannelSummary;
  channelView: AgentChatChannelView | null;
  isActive: boolean;
  icon?: ReactElement;
  rightOptions?: ReactNode;
  isRightOptionsDropdownOpen?: boolean;
};

export const NavigationDrawerAiChatChannelNavigation = ({
  channel,
  summary,
  channelView,
  isActive,
  icon,
  rightOptions,
  isRightOptionsDropdownOpen,
}: NavigationDrawerAiChatChannelNavigationProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const childrenId = useId();
  const { openAgentChatChannel } = useOpenAgentChatChannel();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();
  const [collapsedChannelView, setCollapsedChannelView] =
    useState<AgentChatChannelView | null>(null);
  const isChannelAccessible = channel.isAccessible ?? false;
  const isExpanded =
    isChannelAccessible && isActive && collapsedChannelView !== channelView;
  const selectedItem =
    isActive && isDefined(channelView)
      ? getAgentChatChannelNavigationItem(channelView)
      : undefined;
  const selectedIndex = AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.findIndex(
    (item) => item === selectedItem,
  );
  const areChildrenVisible = isExpanded && isNavigationDrawerContentExpanded;
  const ChevronIcon = isExpanded ? IconChevronDown : IconChevronRight;

  const handleClick = () => {
    if (!isActive) {
      setCollapsedChannelView(null);
      openAgentChatChannel({ channelId: channel.id });

      return;
    }

    if (!isNavigationDrawerContentExpanded && isDefined(channelView)) {
      openAgentChatChannel(channelView);

      return;
    }

    setCollapsedChannelView(isExpanded ? channelView : null);
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
        preventCollapseOnMobile={isNavigationDrawerContentExpanded}
        aria-expanded={isChannelAccessible ? areChildrenVisible : undefined}
        aria-controls={areChildrenVisible ? childrenId : undefined}
        trailingIcon={
          isChannelAccessible ? (
            <ChevronIcon size={theme.icon.size.sm} />
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
