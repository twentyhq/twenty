import { isDefined } from 'twenty-shared/utils';

import { findAgentChatChannelFavoriteNavigationMenuItem } from '@/ai/utils/findAgentChatChannelFavoriteNavigationMenuItem';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useIsAgentChatChannelFavorite = (channelId: string) => {
  const { navigationMenuItems } = useNavigationMenuItemsData();

  return isDefined(
    findAgentChatChannelFavoriteNavigationMenuItem({
      navigationMenuItems,
      channelId,
    }),
  );
};
