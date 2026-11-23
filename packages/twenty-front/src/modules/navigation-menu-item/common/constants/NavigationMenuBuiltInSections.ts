import { msg } from '@lingui/core/macro';
import {
  IconHash,
  IconHeart,
  IconHistory,
  IconInbox,
  IconLego,
  IconMessageHeart,
} from 'twenty-ui/icon';

import { INBOX_CHANNELS_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxChannelsNavigationSectionId';
import { INBOX_FAVORITES_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxFavoritesNavigationSectionId';
import { INBOX_RECENTS_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxRecentsNavigationSectionId';
import { INBOX_TRIAGE_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxTriageNavigationSectionId';
import { AI_AGENTS_NAVIGATION_SECTION_ID } from '@/navigation-menu-item/display/built-in-sections/constants/AiAgentsNavigationSectionId';
import { FAVORITES_NAVIGATION_SECTION_ID } from '@/navigation-menu-item/display/sections/favorites/constants/FavoritesNavigationSectionId';
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
    navigationSectionId: FAVORITES_NAVIGATION_SECTION_ID,
  },
  {
    key: 'aiChatInbox',
    label: msg`Triage`,
    Icon: IconInbox,
    color: 'blue',
    isAi: true,
    navigationSectionId: INBOX_TRIAGE_NAVIGATION_SECTION_ID,
    requiredPermissionFlag: PermissionFlagType.AI,
    requiredFeatureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  },
  {
    key: 'aiChatFavorites',
    label: msg`Favorite chats`,
    Icon: IconMessageHeart,
    color: 'pink',
    isAi: true,
    navigationSectionId: INBOX_FAVORITES_NAVIGATION_SECTION_ID,
    requiredPermissionFlag: PermissionFlagType.AI,
  },
  {
    key: 'aiChatChannels',
    label: msg`Channels`,
    Icon: IconHash,
    color: 'green',
    isAi: true,
    navigationSectionId: INBOX_CHANNELS_NAVIGATION_SECTION_ID,
    requiredPermissionFlag: PermissionFlagType.AI,
    requiredFeatureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  },
  {
    key: 'aiChatRecents',
    label: msg`Recent chats`,
    Icon: IconHistory,
    color: 'orange',
    isAi: true,
    navigationSectionId: INBOX_RECENTS_NAVIGATION_SECTION_ID,
    requiredPermissionFlag: PermissionFlagType.AI,
  },
  {
    key: 'aiAgents',
    label: msg`Agents`,
    Icon: IconLego,
    color: 'purple',
    isAi: false,
    navigationSectionId: AI_AGENTS_NAVIGATION_SECTION_ID,
    requiredPermissionFlag: PermissionFlagType.AI,
  },
] as const;
