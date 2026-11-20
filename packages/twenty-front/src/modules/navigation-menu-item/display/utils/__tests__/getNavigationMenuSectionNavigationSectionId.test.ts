import { getNavigationMenuSectionNavigationSectionId } from '@/navigation-menu-item/display/utils/getNavigationMenuSectionNavigationSectionId';

describe('getNavigationMenuSectionNavigationSectionId', () => {
  it('uses the per-section id for custom sections', () => {
    expect(
      getNavigationMenuSectionNavigationSectionId({ id: 'sales-section-id' }),
    ).toBe('navigation-menu-section-sales-section-id');
  });

  it('uses the shared id of built-in sections that have one', () => {
    expect(
      getNavigationMenuSectionNavigationSectionId({
        id: 'channels-section-id',
        builtInSectionKey: 'aiChatChannels',
      }),
    ).toBe('AiChatChannels');
  });

  it('falls back to the per-section id for other built-in sections', () => {
    expect(
      getNavigationMenuSectionNavigationSectionId({
        id: 'recents-section-id',
        builtInSectionKey: 'aiChatRecents',
      }),
    ).toBe('navigation-menu-section-recents-section-id');
  });
});
