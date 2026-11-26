import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuContainersInDisplayOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainersInDisplayOrder';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const buildItem = (
  item: Pick<NavigationMenuItem, 'id' | 'type' | 'position'> &
    Partial<NavigationMenuItem>,
): NavigationMenuItem => ({
  isActive: true,
  createdAt: '',
  updatedAt: '',
  ...item,
});

describe('getNavigationMenuContainersInDisplayOrder', () => {
  it('keeps unnamed tabs in position order', () => {
    const navigationMenuItems = [
      buildItem({
        id: 'sales',
        type: NavigationMenuItemType.TAB,
        name: 'Sales',
        position: 1,
      }),
      buildItem({
        id: 'unnamed',
        type: NavigationMenuItemType.TAB,
        name: null,
        position: 0,
      }),
    ];

    expect(
      getNavigationMenuContainersInDisplayOrder({
        navigationMenuItems,
        type: NavigationMenuItemType.TAB,
        containerId: null,
      }).map(({ id, name }) => ({ id, name })),
    ).toEqual([
      { id: 'unnamed', name: '' },
      { id: 'sales', name: 'Sales' },
    ]);
  });

  it('skips unnamed sections that are not built in', () => {
    const navigationMenuItems = [
      buildItem({
        id: 'unnamed',
        type: NavigationMenuItemType.SECTION,
        name: null,
        position: 0,
      }),
      buildItem({
        id: 'deals',
        type: NavigationMenuItemType.SECTION,
        name: 'Deals',
        position: 1,
      }),
    ];

    expect(
      getNavigationMenuContainersInDisplayOrder({
        navigationMenuItems,
        type: NavigationMenuItemType.SECTION,
        containerId: null,
      }).map(({ id }) => id),
    ).toEqual(['deals']);
  });
});
