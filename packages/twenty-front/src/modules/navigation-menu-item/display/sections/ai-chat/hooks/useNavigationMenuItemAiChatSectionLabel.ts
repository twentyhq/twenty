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
        return t`Triage`;
      case NavigationMenuItemType.AI_CHAT_FAVORITES:
        return t`Favorite chats`;
      default:
        return t`Recent chats`;
    }
  };

  return { getDefaultAiChatSectionLabel };
};
