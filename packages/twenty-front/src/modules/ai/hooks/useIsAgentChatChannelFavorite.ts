import { isDefined } from 'twenty-shared/utils';

import { findInboxChannelFavoriteNavigationMenuItem } from '@/ai/utils/findAgentChatChannelFavoriteNavigationMenuItem';
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
