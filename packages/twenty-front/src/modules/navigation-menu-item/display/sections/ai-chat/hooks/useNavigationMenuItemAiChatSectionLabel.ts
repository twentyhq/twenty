import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const useNavigationMenuItemAiChatSectionLabel = () => {
  const { t } = useLingui();

  const labelBySectionType: Partial<Record<NavigationMenuItemType, string>> = {
    [NavigationMenuItemType.AI_CHAT_INBOX]: t`Inbox`,
    [NavigationMenuItemType.AI_CHAT_FAVORITES]: t`Favorite chats`,
    [NavigationMenuItemType.AI_CHAT_CHANNELS]: t`Channels`,
    [NavigationMenuItemType.AI_AGENTS]: t`Agents`,
    [NavigationMenuItemType.FAVORITES]: t`Favorites`,
  };

  const getDefaultAiChatSectionLabel = (
    type: NavigationMenuItem['type'],
  ): string => labelBySectionType[type] ?? t`Recent chats`;

  return { getDefaultAiChatSectionLabel };
};
