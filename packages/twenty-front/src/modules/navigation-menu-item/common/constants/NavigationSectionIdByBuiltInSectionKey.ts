import { type BuiltInSectionKey } from 'twenty-shared/types';

export const NAVIGATION_SECTION_ID_BY_BUILT_IN_SECTION_KEY: Partial<
  Record<BuiltInSectionKey, string>
> = {
  favorites: 'Favorites',
  aiChatInbox: 'AiChatTriage',
  aiChatFavorites: 'AiChatFavorites',
  aiChatChannels: 'AiChatChannels',
};
