import { NavigationMenuItemType } from 'twenty-shared/types';

import { canAddBuiltInSectionToContainer } from '@/navigation-menu-item/common/utils/canAddBuiltInSectionToContainer';

const items = [
  { type: NavigationMenuItemType.AI_CHAT_RECENTS, parentId: 'sales-tab' },
];

describe('canAddBuiltInSectionToContainer', () => {
  it('should refuse a built-in section its container already holds', () => {
    expect(
      canAddBuiltInSectionToContainer({
        type: NavigationMenuItemType.AI_CHAT_RECENTS,
        containerId: 'sales-tab',
        items,
      }),
    ).toBe(false);
    expect(
      canAddBuiltInSectionToContainer({
        type: NavigationMenuItemType.AI_CHAT_RECENTS,
        containerId: null,
        items,
      }),
    ).toBe(true);
  });

  it('should refuse Favorites on Home only', () => {
    expect(
      canAddBuiltInSectionToContainer({
        type: NavigationMenuItemType.FAVORITES,
        containerId: null,
        items: [],
      }),
    ).toBe(false);
    expect(
      canAddBuiltInSectionToContainer({
        type: NavigationMenuItemType.FAVORITES,
        containerId: 'sales-tab',
        items: [],
      }),
    ).toBe(true);
  });
});
