import { isNavigationMenuBuiltInSectionAvailable } from '@/navigation-menu-item/common/utils/isNavigationMenuBuiltInSectionAvailable';

describe('isNavigationMenuBuiltInSectionAvailable', () => {
  it('should keep Favorite chats and Recent chats with the AI inbox off', () => {
    for (const builtInSectionKey of ['aiChatFavorites', 'aiChatRecents']) {
      expect(
        isNavigationMenuBuiltInSectionAvailable({
          builtInSectionKey,
          hasAiPermission: true,
          isAiChatInboxEnabled: false,
        }),
      ).toBe(true);
    }
  });

  it('should drop Triage and Channels with the AI inbox off', () => {
    for (const builtInSectionKey of ['aiChatInbox', 'aiChatChannels']) {
      expect(
        isNavigationMenuBuiltInSectionAvailable({
          builtInSectionKey,
          hasAiPermission: true,
          isAiChatInboxEnabled: false,
        }),
      ).toBe(false);
    }
  });

  it('should drop every AI section without the AI permission', () => {
    expect(
      isNavigationMenuBuiltInSectionAvailable({
        builtInSectionKey: 'aiChatRecents',
        hasAiPermission: false,
        isAiChatInboxEnabled: true,
      }),
    ).toBe(false);
  });

  it('should keep personal Favorites regardless of AI access', () => {
    expect(
      isNavigationMenuBuiltInSectionAvailable({
        builtInSectionKey: 'favorites',
        hasAiPermission: false,
        isAiChatInboxEnabled: false,
      }),
    ).toBe(true);
  });
});
