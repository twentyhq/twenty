import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const findAgentChatChannelFavoriteNavigationMenuItem = ({
  navigationMenuItems,
  channelId,
}: {
  navigationMenuItems: NavigationMenuItem[];
  channelId: string;
}) =>
  navigationMenuItems.find(
    (navigationMenuItem) =>
      navigationMenuItem.type === NavigationMenuItemType.AGENT_CHAT_CHANNEL &&
      navigationMenuItem.agentChatChannelId === channelId,
  );
