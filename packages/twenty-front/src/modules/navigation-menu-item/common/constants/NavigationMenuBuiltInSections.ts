import { msg } from '@lingui/core/macro';
import {
  IconHash,
  IconHeart,
  IconHistory,
  IconInbox,
  IconMessage,
} from 'twenty-ui/icon';

export const NAVIGATION_MENU_BUILT_IN_SECTIONS = [
  {
    key: 'favorites',
    label: msg`Favorites`,
    Icon: IconHeart,
    color: 'red',
    isAi: false,
    requiresAiChatInbox: false,
  },
  {
    key: 'aiChatInbox',
    label: msg`Triage`,
    Icon: IconInbox,
    color: 'blue',
    isAi: true,
    requiresAiChatInbox: true,
  },
  {
    key: 'aiChatFavorites',
    label: msg`Favorite chats`,
    Icon: IconMessage,
    color: 'pink',
    isAi: true,
    requiresAiChatInbox: false,
  },
  {
    key: 'aiChatChannels',
    label: msg`Channels`,
    Icon: IconHash,
    color: 'green',
    isAi: true,
    requiresAiChatInbox: true,
  },
  {
    key: 'aiChatRecents',
    label: msg`Recent chats`,
    Icon: IconHistory,
    color: 'orange',
    isAi: true,
    requiresAiChatInbox: false,
  },
] as const;
