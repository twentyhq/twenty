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
import { AI_AGENTS_NAVIGATION_SECTION_ID } from '@/navigation-menu-item/common/constants/AiAgentsNavigationSectionId';
import { FAVORITES_NAVIGATION_SECTION_ID } from '@/navigation-menu-item/common/constants/FavoritesNavigationSectionId';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const NAVIGATION_MENU_BUILT_IN_SECTIONS = [
  {
    key: 'favorites',
    navigationSectionId: FAVORITES_NAVIGATION_SECTION_ID,
    label: msg`Favorites`,
    Icon: IconHeart,
    color: 'red',
    isAi: false,
  },
  {
    key: 'aiChatInbox',
    navigationSectionId: INBOX_TRIAGE_NAVIGATION_SECTION_ID,
    label: msg`Inbox`,
    Icon: IconInbox,
    color: 'blue',
    isAi: true,
    requiredPermissionFlag: PermissionFlagType.AI,
    requiredFeatureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  },
  {
    key: 'aiChatFavorites',
    navigationSectionId: INBOX_FAVORITES_NAVIGATION_SECTION_ID,
    label: msg`Favorite chats`,
    Icon: IconMessageHeart,
    color: 'pink',
    isAi: true,
    requiredPermissionFlag: PermissionFlagType.AI,
  },
  {
    key: 'aiChatChannels',
    navigationSectionId: INBOX_CHANNELS_NAVIGATION_SECTION_ID,
    label: msg`Channels`,
    Icon: IconHash,
    color: 'green',
    isAi: true,
    requiredPermissionFlag: PermissionFlagType.AI,
    requiredFeatureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  },
  {
    key: 'aiChatRecents',
    navigationSectionId: INBOX_RECENTS_NAVIGATION_SECTION_ID,
    label: msg`Recent chats`,
    Icon: IconHistory,
    color: 'orange',
    isAi: true,
    requiredPermissionFlag: PermissionFlagType.AI,
  },
  {
    key: 'aiAgents',
    navigationSectionId: AI_AGENTS_NAVIGATION_SECTION_ID,
    label: msg`Agents`,
    Icon: IconLego,
    color: 'purple',
    isAi: false,
    requiredPermissionFlag: PermissionFlagType.AI,
  },
] as const;
