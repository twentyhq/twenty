import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconHash,
  IconHeart,
  IconInbox,
  IconLego,
  IconMessage,
  type IconComponent,
} from 'twenty-ui/icon';

export const NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS = {
  [NavigationMenuItemType.FAVORITES]: {
    label: msg`Favorites`,
    Icon: IconHeart,
  },
  [NavigationMenuItemType.AI_CHAT_INBOX]: {
    label: msg`Inbox`,
    Icon: IconInbox,
  },
  [NavigationMenuItemType.AI_CHAT_FAVORITES]: {
    label: msg`Favorite chats`,
    Icon: IconHeart,
  },
  [NavigationMenuItemType.AI_CHAT_CHANNELS]: {
    label: msg`Channels`,
    Icon: IconHash,
  },
  [NavigationMenuItemType.AI_CHAT_RECENTS]: {
    label: msg`Recent chats`,
    Icon: IconMessage,
  },
  [NavigationMenuItemType.AI_AGENTS]: { label: msg`Agents`, Icon: IconLego },
} satisfies Partial<
  Record<
    NavigationMenuItemType,
    { label: MessageDescriptor; Icon: IconComponent }
  >
>;
