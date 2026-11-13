import { isDefined } from 'twenty-shared/utils';

import { findInboxChannelFavoriteNavigationMenuItem } from '@/ai/utils/findInboxChannelFavoriteNavigationMenuItem';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useRemoveInboxChannelFromFavorites = () => {
  const { navigationMenuItems } = useNavigationMenuItemsData();
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const removeInboxChannelFromFavorites = (channelId: string) => {
    const favoriteNavigationMenuItem =
      findInboxChannelFavoriteNavigationMenuItem({
        navigationMenuItems,
        channelId,
      });

    if (!isDefined(favoriteNavigationMenuItem)) {
      return;
    }

    void deleteManyNavigationMenuItems([favoriteNavigationMenuItem.id]);
  };

  return { removeInboxChannelFromFavorites };
};
