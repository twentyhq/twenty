import { msg } from '@lingui/core/macro';
import {
  IconHash,
  IconHeart,
  IconHistory,
  IconInbox,
  IconMessageHeart,
} from 'twenty-ui/icon';

export const NAVIGATION_MENU_BUILT_IN_SECTIONS = [
  {
    key: 'favorites',
    label: msg`Favorites`,
    Icon: IconHeart,
    color: 'red',
    isAi: false,
    isRenamable: true,
  },
  {
    key: 'aiChatInbox',
    label: msg`Triage`,
    Icon: IconInbox,
    color: 'blue',
    isAi: true,
    isRenamable: false,
  },
  {
    key: 'aiChatFavorites',
    label: msg`Favorite chats`,
    Icon: IconMessageHeart,
    color: 'pink',
    isAi: true,
    isRenamable: true,
  },
  {
    key: 'aiChatChannels',
    label: msg`Channels`,
    Icon: IconHash,
    color: 'green',
    isAi: true,
    isRenamable: true,
  },
  {
    key: 'aiChatRecents',
    label: msg`Recent chats`,
    Icon: IconHistory,
    color: 'orange',
    isAi: true,
    isRenamable: false,
  },
] as const;
