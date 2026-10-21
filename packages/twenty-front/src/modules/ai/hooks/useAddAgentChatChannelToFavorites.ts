import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { useCreateManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useCreateManyNavigationMenuItems';
import { getNextUserFavoritePosition } from '@/navigation-menu-item/common/utils/getNextUserFavoritePosition';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';

export const useAddAgentChatChannelToFavorites = () => {
  const { navigationMenuItems, currentUserWorkspaceId } =
    useNavigationMenuItemsData();
  const { createManyNavigationMenuItems } = useCreateManyNavigationMenuItems();

  const addAgentChatChannelToFavorites = (channelId: string) => {
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

  return { addAgentChatChannelToFavorites };
};
