import { useLingui } from '@lingui/react/macro';
import { type ReactElement, type ReactNode, useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { AgentChatChannelIcon } from '@/ai/components/AgentChatChannelIcon';
import { AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS } from '@/ai/constants/AgentChatChannelNavigationItems';
import { type AgentChatChannelSummary } from '@/ai/types/AgentChatChannelSummary';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemGroup';
import { useIsNavigationDrawerContentExpanded } from '@/ui/navigation/navigation-drawer/hooks/useIsNavigationDrawerContentExpanded';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import {
  type AgentChatChannel,
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';

type NavigationDrawerAiChatChannelNavigationProps = {
  channel: AgentChatChannel;
  summary?: AgentChatChannelSummary;
  channelView: AgentChatChannelView | null;
  isActive: boolean;
  icon?: ReactElement;
  rightOptions?: ReactNode;
  isRightOptionsDropdownOpen?: boolean;
  onNavigate: (channelView: AgentChatChannelView) => void;
};

export const NavigationDrawerAiChatChannelNavigation = ({
  channel,
  summary,
  channelView,
  isActive,
  icon,
  rightOptions,
  isRightOptionsDropdownOpen,
  onNavigate,
}: NavigationDrawerAiChatChannelNavigationProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const childrenId = useId();
  const isNavigationDrawerContentExpanded =
    useIsNavigationDrawerContentExpanded();
  const [expansionOverride, setExpansionOverride] = useState<{
    channelView: AgentChatChannelView | null;
    isExpanded: boolean;
  } | null>(null);
  const isExpanded =
    channel.isAccessible === true &&
    (isDefined(expansionOverride) &&
    expansionOverride.channelView === channelView
      ? expansionOverride.isExpanded
      : isActive);
  const matchingIndex = isActive
    ? AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.findIndex(
        ({ channelStatus, assignment }) =>
          channelStatus === channelView?.channelStatus &&
          assignment === channelView.assignment,
      )
    : -1;
  const selectedIndex =
    isActive && matchingIndex < 0
      ? AGENT_CHAT_CHANNEL_NAVIGATION_ITEMS.findIndex(
          ({ channelStatus }) => channelStatus === channelView?.channelStatus,
        )
      : matchingIndex;
  const areChildrenVisible = isExpanded && isNavigationDrawerContentExpanded;
  const ChevronIcon = isExpanded ? IconChevronDown : IconChevronRight;

  const handleClick = () => {
    setExpansionOverride({ channelView, isExpanded: !isExpanded });

    if (!isActive || !isNavigationDrawerContentExpanded) {
      onNavigate({
        channelId: channel.id,
        channelStatus: AgentChatChannelThreadStatus.OPEN,
        assignment: AgentChatChannelAssignmentFilter.ANY,
      });
    }
  };

  return (
    <NavigationDrawerItemGroup>
      <NavigationDrawerItem
        label={channel.name}
        secondaryLabel={channel.isAccessible ? undefined : t`Not open to you`}
        Icon={icon ?? <AgentChatChannelIcon channel={channel} />}
        variant={channel.isAccessible ? 'default' : 'tertiary'}
        isUnread={summary?.hasUnreadOpen}
        active={isActive && !areChildrenVisible}
        onClick={channel.isAccessible ? handleClick : undefined}
        triggerEvent="CLICK"
        preventCollapseOnMobile={isNavigationDrawerContentExpanded}
        aria-expanded={channel.isAccessible ? areChildrenVisible : undefined}
        aria-controls={areChildrenVisible ? childrenId : undefined}
        trailingIcon={
          channel.isAccessible ? (
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
                    onNavigate({
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
