import { type BuiltInSectionKey } from 'twenty-shared/types';

import { INBOX_CHANNELS_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxChannelsNavigationSectionId';
import { INBOX_FAVORITES_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxFavoritesNavigationSectionId';
import { INBOX_TRIAGE_NAVIGATION_SECTION_ID } from '@/inbox/constants/InboxTriageNavigationSectionId';
import { FAVORITES_NAVIGATION_SECTION_ID } from '@/navigation-menu-item/display/sections/favorites/constants/FavoritesNavigationSectionId';

export const NAVIGATION_SECTION_ID_BY_BUILT_IN_SECTION_KEY: Partial<
  Record<BuiltInSectionKey, string>
> = {
  favorites: FAVORITES_NAVIGATION_SECTION_ID,
  aiChatInbox: INBOX_TRIAGE_NAVIGATION_SECTION_ID,
  aiChatFavorites: INBOX_FAVORITES_NAVIGATION_SECTION_ID,
  aiChatChannels: INBOX_CHANNELS_NAVIGATION_SECTION_ID,
};
