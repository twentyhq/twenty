import { buildOptimisticNavigationMenuItem } from '@/navigation-menu-item/common/utils/buildOptimisticNavigationMenuItem';
import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { NavigationMenuItemType } from '~/generated-metadata/graphql';

describe('buildOptimisticNavigationMenuItem', () => {
  it('should keep a standalone page visible in the sidebar before the server responds', () => {
    const optimisticItem = buildOptimisticNavigationMenuItem({
      id: '95e7bd9c-7a0e-4a9f-94a6-8b8a9c2c9a4f',
      type: NavigationMenuItemType.PAGE_LAYOUT,
      pageLayoutId: '0a0be2ee-2f5f-4a5a-b1e5-1b5c8e3a4f21',
      name: 'Revenue',
    });

    expect(optimisticItem.pageLayoutId).toBe(
      '0a0be2ee-2f5f-4a5a-b1e5-1b5c8e3a4f21',
    );
    expect(
      filterAndSortNavigationMenuItems([optimisticItem], [], [], false),
    ).toEqual([optimisticItem]);
  });
});
