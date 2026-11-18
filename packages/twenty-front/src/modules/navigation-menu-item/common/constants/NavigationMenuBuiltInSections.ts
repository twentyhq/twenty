import { msg } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconHash,
  IconHeart,
  IconHistory,
  IconInbox,
  IconMessage,
} from 'twenty-ui/icon';

export const NAVIGATION_MENU_BUILT_IN_SECTIONS = [
  {
    type: NavigationMenuItemType.FAVORITES,
    label: msg`Favorites`,
    Icon: IconHeart,
    color: 'red',
    isAi: false,
  },
  {
    type: NavigationMenuItemType.AI_CHAT_INBOX,
    label: msg`Triage`,
    Icon: IconInbox,
    color: 'blue',
    isAi: true,
  },
  {
    type: NavigationMenuItemType.AI_CHAT_FAVORITES,
    label: msg`Favorite chats`,
    Icon: IconMessage,
    color: 'pink',
    isAi: true,
  },
  {
    type: NavigationMenuItemType.AI_CHAT_CHANNELS,
    label: msg`Channels`,
    Icon: IconHash,
    color: 'green',
    isAi: true,
  },
  {
    type: NavigationMenuItemType.AI_CHAT_RECENTS,
    label: msg`Recent chats`,
    Icon: IconHistory,
    color: 'orange',
    isAi: true,
  },
] as const;
