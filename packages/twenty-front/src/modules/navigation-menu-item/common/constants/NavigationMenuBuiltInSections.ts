import { msg } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';

export const NAVIGATION_MENU_BUILT_IN_SECTIONS = [
  {
    type: NavigationMenuItemType.FAVORITES,
    label: msg`Favorites`,
    isAi: false,
  },
  {
    type: NavigationMenuItemType.AI_CHAT_INBOX,
    label: msg`Triage`,
    isAi: true,
  },
  {
    type: NavigationMenuItemType.AI_CHAT_FAVORITES,
    label: msg`Favorite chats`,
    isAi: true,
  },
  {
    type: NavigationMenuItemType.AI_CHAT_CHANNELS,
    label: msg`Channels`,
    isAi: true,
  },
  {
    type: NavigationMenuItemType.AI_CHAT_RECENTS,
    label: msg`Recent chats`,
    isAi: true,
  },
] as const;
