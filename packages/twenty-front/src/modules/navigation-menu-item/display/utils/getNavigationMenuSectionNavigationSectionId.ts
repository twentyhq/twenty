import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatChannelsNavigationSectionId';
import { AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatFavoritesNavigationSectionId';
import { AI_CHAT_RECENTS_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatRecentsNavigationSectionId';
import { AI_CHAT_INBOX_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatInboxNavigationSectionId';
import { FAVORITES_NAVIGATION_SECTION_ID } from '@/navigation-menu-item/display/sections/favorites/constants/FavoritesNavigationSectionId';

const NAVIGATION_SECTION_ID_BY_SECTION_TYPE: Partial<
  Record<NavigationMenuItemType, string>
> = {
  [NavigationMenuItemType.AI_CHAT_INBOX]: AI_CHAT_INBOX_NAVIGATION_SECTION_ID,
  [NavigationMenuItemType.AI_CHAT_FAVORITES]:
    AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID,
  [NavigationMenuItemType.AI_CHAT_CHANNELS]:
    AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID,
  [NavigationMenuItemType.AI_CHAT_RECENTS]:
    AI_CHAT_RECENTS_NAVIGATION_SECTION_ID,
  [NavigationMenuItemType.FAVORITES]: FAVORITES_NAVIGATION_SECTION_ID,
};

export const getNavigationMenuSectionNavigationSectionId = (
  section: Pick<NavigationMenuItem, 'id' | 'type'>,
) =>
  NAVIGATION_SECTION_ID_BY_SECTION_TYPE[section.type] ??
  `navigation-menu-section-${section.id}`;
