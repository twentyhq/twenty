import { canAddBuiltInSectionToContainer } from '@/navigation-menu-item/common/utils/canAddBuiltInSectionToContainer';

const items = [{ builtInSectionKey: 'aiChatRecents', parentId: 'sales-tab' }];

describe('canAddBuiltInSectionToContainer', () => {
  it('should refuse a built-in section its container already holds', () => {
    expect(
      canAddBuiltInSectionToContainer({
        builtInSectionKey: 'aiChatRecents',
        containerId: 'sales-tab',
        items,
      }),
    ).toBe(false);
    expect(
      canAddBuiltInSectionToContainer({
        builtInSectionKey: 'aiChatRecents',
        containerId: null,
        items,
      }),
    ).toBe(true);
  });

  it('should offer Favorites on Home once no Favorites section is there', () => {
    expect(
      canAddBuiltInSectionToContainer({
        builtInSectionKey: 'favorites',
        containerId: null,
        items: [],
      }),
    ).toBe(true);
    expect(
      canAddBuiltInSectionToContainer({
        builtInSectionKey: 'favorites',
        containerId: null,
        items: [{ builtInSectionKey: 'favorites', parentId: null }],
      }),
    ).toBe(false);
    expect(
      canAddBuiltInSectionToContainer({
        builtInSectionKey: 'favorites',
        containerId: 'sales-tab',
        items: [],
      }),
    ).toBe(true);
  });
});
