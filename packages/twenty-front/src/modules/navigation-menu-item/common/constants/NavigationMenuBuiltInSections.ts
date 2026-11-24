import { msg } from '@lingui/core/macro';
import {
  IconHash,
  IconHeart,
  IconHistory,
  IconInbox,
  IconLego,
  IconMessageHeart,
} from 'twenty-ui/icon';

import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const NAVIGATION_MENU_BUILT_IN_SECTIONS = [
  {
    key: 'favorites',
    label: msg`Favorites`,
    Icon: IconHeart,
    color: 'red',
    isAi: false,
  },
  {
    key: 'aiChatInbox',
    label: msg`Inbox`,
    Icon: IconInbox,
    color: 'blue',
    isAi: true,
    requiredPermissionFlag: PermissionFlagType.AI,
    requiredFeatureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  },
  {
    key: 'aiChatFavorites',
    label: msg`Favorite chats`,
    Icon: IconMessageHeart,
    color: 'pink',
    isAi: true,
    requiredPermissionFlag: PermissionFlagType.AI,
  },
  {
    key: 'aiChatChannels',
    label: msg`Channels`,
    Icon: IconHash,
    color: 'green',
    isAi: true,
    requiredPermissionFlag: PermissionFlagType.AI,
    requiredFeatureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  },
  {
    key: 'aiChatRecents',
    label: msg`Recent chats`,
    Icon: IconHistory,
    color: 'orange',
    isAi: true,
    requiredPermissionFlag: PermissionFlagType.AI,
  },
  {
    key: 'aiAgents',
    label: msg`Agents`,
    Icon: IconLego,
    color: 'purple',
    isAi: false,
    requiredPermissionFlag: PermissionFlagType.AI,
  },
] as const;
