import { NavigationMenuItemType } from 'twenty-shared/types';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatChannelsNavigationSectionId';
import { AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatFavoritesNavigationSectionId';
import { AI_CHAT_RECENTS_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatRecentsNavigationSectionId';
import { AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatTriageNavigationSectionId';
import { FAVORITES_NAVIGATION_SECTION_ID } from '@/navigation-menu-item/display/sections/favorites/constants/FavoritesNavigationSectionId';

export const getNavigationMenuSectionNavigationSectionId = (
  section: Pick<NavigationMenuItem, 'id' | 'type'>,
) => {
  switch (section.type) {
    case NavigationMenuItemType.AI_CHAT_TRIAGE:
      return AI_CHAT_TRIAGE_NAVIGATION_SECTION_ID;
    case NavigationMenuItemType.AI_CHAT_FAVORITES:
      return AI_CHAT_FAVORITES_NAVIGATION_SECTION_ID;
    case NavigationMenuItemType.AI_CHAT_CHANNELS:
      return AI_CHAT_CHANNELS_NAVIGATION_SECTION_ID;
    case NavigationMenuItemType.AI_CHAT_RECENTS:
      return AI_CHAT_RECENTS_NAVIGATION_SECTION_ID;
    case NavigationMenuItemType.FAVORITES:
      return FAVORITES_NAVIGATION_SECTION_ID;
    default:
      return `navigation-menu-section-${section.id}`;
  }
};
