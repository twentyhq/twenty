import { isDefined } from 'twenty-shared/utils';

import { findAgentChatChannelFavoriteNavigationMenuItem } from '@/ai/utils/findAgentChatChannelFavoriteNavigationMenuItem';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useRemoveAgentChatChannelFromFavorites = () => {
  const { navigationMenuItems } = useNavigationMenuItemsData();
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const removeAgentChatChannelFromFavorites = (channelId: string) => {
    const favoriteNavigationMenuItem =
      findAgentChatChannelFavoriteNavigationMenuItem({
        navigationMenuItems,
        channelId,
      });

    if (!isDefined(favoriteNavigationMenuItem)) {
      return;
    }

    void deleteManyNavigationMenuItems([favoriteNavigationMenuItem.id]);
  };

  return { removeAgentChatChannelFromFavorites };
};
