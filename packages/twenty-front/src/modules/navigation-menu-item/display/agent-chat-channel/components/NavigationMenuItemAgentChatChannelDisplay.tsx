import { isDefined } from 'twenty-shared/utils';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useAgentChatChannelNavigationMenuItem } from '@/navigation-menu-item/display/agent-chat-channel/hooks/useAgentChatChannelNavigationMenuItem';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemAgentChatChannelDisplayProps =
  NavigationMenuItemSectionContentProps;

export const NavigationMenuItemAgentChatChannelDisplay = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemAgentChatChannelDisplayProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const agentChatChannelNavigationMenuItem =
    useAgentChatChannelNavigationMenuItem(item);

  if (!isDefined(agentChatChannelNavigationMenuItem)) {
    return null;
  }

  const { channel, summary, isActive, openChannel } =
    agentChatChannelNavigationMenuItem;
  const openCount = summary?.openCount ?? 0;

  return (
    <NavigationDrawerItem
      label={channel.name}
      secondaryLabel={openCount > 0 ? `${openCount}` : undefined}
      isUnread={summary?.hasUnreadOpen}
      onClick={
        isLayoutCustomizationModeEnabled
          ? editModeProps?.onEditModeClick
          : isDragging
            ? undefined
            : openChannel
      }
      Icon={() => <NavigationMenuItemIcon navigationMenuItem={item} />}
      active={isActive}
      isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={rightOptions}
    />
  );
};
