import { msg } from '@lingui/core/macro';

export const NAVIGATION_MENU_BUILT_IN_SECTIONS = [
  {
    key: 'favorites',
    label: msg`Favorites`,
    isAi: false,
  },
  {
    key: 'aiChatInbox',
    label: msg`Triage`,
    isAi: true,
  },
  {
    key: 'aiChatFavorites',
    label: msg`Favorite chats`,
    isAi: true,
  },
  {
    key: 'aiChatChannels',
    label: msg`Channels`,
    isAi: true,
  },
  {
    key: 'aiChatRecents',
    label: msg`Recent chats`,
    isAi: true,
  },
] as const;
