import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/common/utils/getNavigationMenuSectionNavigationSectionId';

describe('getNavigationMenuSectionNavigationSectionId', () => {
  it('should use the section id for a custom section', () => {
    expect(
      getNavigationMenuSectionNavigationSectionId({
        id: 'section-1',
        builtInSectionKey: null,
      }),
    ).toBe('navigation-menu-section-section-1');
  });

  it.each([
    ['favorites', 'Favorites'],
    ['aiChatInbox', 'AiChatTriage'],
    ['aiChatFavorites', 'AiChatFavorites'],
    ['aiChatChannels', 'AiChatChannels'],
    ['aiChatRecents', 'AiChatRecents'],
    ['aiAgents', 'AiAgents'],
  ])(
    'should use the id the %s section saves its collapse state under',
    (builtInSectionKey, navigationSectionId) => {
      expect(
        getNavigationMenuSectionNavigationSectionId({
          id: 'section-1',
          builtInSectionKey,
        }),
      ).toBe(navigationSectionId);
    },
  );

  it('should fall back to the section id for an unknown built-in key', () => {
    expect(
      getNavigationMenuSectionNavigationSectionId({
        id: 'section-1',
        builtInSectionKey: 'unknown',
      }),
    ).toBe('navigation-menu-section-section-1');
  });
});
