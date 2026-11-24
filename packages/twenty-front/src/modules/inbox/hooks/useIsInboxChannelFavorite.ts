import { isDefined } from 'twenty-shared/utils';

import { findInboxChannelFavoriteNavigationMenuItem } from '@/inbox/utils/findInboxChannelFavoriteNavigationMenuItem';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useIsInboxChannelFavorite = (channelId: string) => {
  const { navigationMenuItems } = useNavigationMenuItemsData();

  return isDefined(
    findInboxChannelFavoriteNavigationMenuItem({
      navigationMenuItems,
      channelId,
    }),
  );
};
