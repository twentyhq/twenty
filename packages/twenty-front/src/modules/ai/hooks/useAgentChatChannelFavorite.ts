import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { getNextUserFavoritePosition } from '@/navigation-menu-item/common/utils/getNextUserFavoritePosition';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useAgentChatChannelFavorite = (channelId: string) => {
  const { navigationMenuItems, currentUserWorkspaceId } =
    useNavigationMenuItemsData();
  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const favoriteNavigationMenuItem = navigationMenuItems.find(
    (item) =>
      item.type === NavigationMenuItemType.AGENT_CHAT_CHANNEL &&
      item.agentChatChannelId === channelId,
  );

  const addToFavorites = () => {
    void createManyNavigationMenuItems([
      {
        id: v4(),
        type: NavigationMenuItemType.AGENT_CHAT_CHANNEL,
        agentChatChannelId: channelId,
        userWorkspaceId: currentUserWorkspaceId,
        position: getNextUserFavoritePosition(navigationMenuItems),
      },
    ]);
  };

  const removeFromFavorites = () => {
    if (isDefined(favoriteNavigationMenuItem)) {
      void deleteManyNavigationMenuItems([favoriteNavigationMenuItem.id]);
    }
  };

  return {
    isFavorite: isDefined(favoriteNavigationMenuItem),
    addToFavorites,
    removeFromFavorites,
  };
};
