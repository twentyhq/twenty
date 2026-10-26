import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const useNavigationMenuItemAiChatSectionLabel = () => {
  const { t } = useLingui();

  const getDefaultAiChatSectionLabel = (
    type: NavigationMenuItem['type'],
  ): string => {
    switch (type) {
      case NavigationMenuItemType.AI_CHAT_TRIAGE:
        return t`Inbox`;
      case NavigationMenuItemType.AI_CHAT_FAVORITES:
        return t`Favorite chats`;
      case NavigationMenuItemType.AI_CHAT_CHANNELS:
        return t`Channels`;
      case NavigationMenuItemType.AI_AGENTS:
        return t`Agents`;
      case NavigationMenuItemType.FAVORITES:
        return t`Favorites`;
      default:
        return t`Recent chats`;
    }
  };

  return { getDefaultAiChatSectionLabel };
};
