import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconHash,
  IconHeart,
  IconHistory,
  IconInbox,
  IconLego,
  IconMessageHeart,
  type IconComponent,
} from 'twenty-ui/icon';

export const NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS = {
  [NavigationMenuItemType.FAVORITES]: {
    label: msg`Favorites`,
    Icon: IconHeart,
    color: 'red',
  },
  [NavigationMenuItemType.AI_CHAT_INBOX]: {
    label: msg`Inbox`,
    Icon: IconInbox,
    color: 'blue',
  },
  [NavigationMenuItemType.AI_CHAT_FAVORITES]: {
    label: msg`Favorite chats`,
    Icon: IconMessageHeart,
    color: 'pink',
  },
  [NavigationMenuItemType.AI_CHAT_CHANNELS]: {
    label: msg`Channels`,
    Icon: IconHash,
    color: 'green',
  },
  [NavigationMenuItemType.AI_CHAT_RECENTS]: {
    label: msg`Recent chats`,
    Icon: IconHistory,
    color: 'orange',
  },
  [NavigationMenuItemType.AI_AGENTS]: {
    label: msg`Agents`,
    Icon: IconLego,
    color: 'purple',
  },
} satisfies Partial<
  Record<
    NavigationMenuItemType,
    { label: MessageDescriptor; Icon: IconComponent; color: string }
  >
>;
