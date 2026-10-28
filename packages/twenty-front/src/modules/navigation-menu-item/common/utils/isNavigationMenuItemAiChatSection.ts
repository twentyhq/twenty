import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemAiChatSection = (
  item: Pick<NavigationMenuItem, 'type'>,
) =>
  item.type === NavigationMenuItemType.AI_CHAT_INBOX ||
  item.type === NavigationMenuItemType.AI_CHAT_FAVORITES ||
  item.type === NavigationMenuItemType.AI_CHAT_CHANNELS ||
  item.type === NavigationMenuItemType.AI_CHAT_RECENTS;
