import { canMoveBuiltInSectionToContainer } from '@/navigation-menu-item/common/utils/canMoveBuiltInSectionToContainer';

const items = [
  { builtInSectionKey: 'aiChatRecents', parentId: 'sales-tab' },
  { builtInSectionKey: 'favorites', parentId: 'sales-tab' },
];

describe('canMoveBuiltInSectionToContainer', () => {
  it('should accept a tab that already holds the same AI section', () => {
    expect(
      canMoveBuiltInSectionToContainer({
        builtInSectionKey: 'aiChatRecents',
        containerId: 'sales-tab',
        items,
      }),
    ).toBe(true);
  });

  it('should keep Favorites to one per container, Home included', () => {
    expect(
      canMoveBuiltInSectionToContainer({
        builtInSectionKey: 'favorites',
        containerId: 'sales-tab',
        items,
      }),
    ).toBe(false);
    expect(
      canMoveBuiltInSectionToContainer({
        builtInSectionKey: 'favorites',
        containerId: null,
        items,
      }),
    ).toBe(true);
    expect(
      canMoveBuiltInSectionToContainer({
        builtInSectionKey: 'favorites',
        containerId: null,
        items: [...items, { builtInSectionKey: 'favorites', parentId: null }],
      }),
    ).toBe(false);
    expect(
      canMoveBuiltInSectionToContainer({
        builtInSectionKey: 'favorites',
        containerId: 'support-tab',
        items,
      }),
    ).toBe(true);
  });
});
