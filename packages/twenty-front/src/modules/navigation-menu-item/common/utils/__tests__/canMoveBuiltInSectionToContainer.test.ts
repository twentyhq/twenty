import { canMoveBuiltInSectionToContainer } from '@/navigation-menu-item/common/utils/canMoveBuiltInSectionToContainer';

describe('canMoveBuiltInSectionToContainer', () => {
  it('should accept any container for an AI section', () => {
    expect(
      canMoveBuiltInSectionToContainer({
        builtInSectionKey: 'aiChatRecents',
        containerId: null,
      }),
    ).toBe(true);
    expect(
      canMoveBuiltInSectionToContainer({
        builtInSectionKey: 'aiChatRecents',
        containerId: 'sales-tab',
      }),
    ).toBe(true);
  });

  it('should refuse Favorites on Home only', () => {
    expect(
      canMoveBuiltInSectionToContainer({
        builtInSectionKey: 'favorites',
        containerId: null,
      }),
    ).toBe(false);
    expect(
      canMoveBuiltInSectionToContainer({
        builtInSectionKey: 'favorites',
        containerId: 'sales-tab',
      }),
    ).toBe(true);
  });
});
