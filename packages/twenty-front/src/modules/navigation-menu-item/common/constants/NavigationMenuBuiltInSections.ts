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
    isAiPermissionRequired: false,
    isAiChatInboxRequired: false,
  },
  {
    key: 'aiChatInbox',
    label: msg`Triage`,
    Icon: IconInbox,
    color: 'blue',
    isAi: true,
    isAiPermissionRequired: true,
    isAiChatInboxRequired: true,
  },
  {
    key: 'aiChatFavorites',
    label: msg`Favorite chats`,
    Icon: IconMessage,
    color: 'pink',
    isAi: true,
    isAiPermissionRequired: true,
    isAiChatInboxRequired: false,
  },
  {
    key: 'aiChatChannels',
    label: msg`Channels`,
    Icon: IconHash,
    color: 'green',
    isAi: true,
    isAiPermissionRequired: true,
    isAiChatInboxRequired: true,
  },
  {
    key: 'aiChatRecents',
    label: msg`Recent chats`,
    Icon: IconHistory,
    color: 'orange',
    isAi: true,
    isAiPermissionRequired: true,
    isAiChatInboxRequired: false,
  },
] as const;
