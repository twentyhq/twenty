import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuContainerChildrenInPositionOrder } from '@/navigation-menu-item/common/utils/getNavigationMenuContainerChildrenInPositionOrder';

describe('getNavigationMenuContainerChildrenInPositionOrder', () => {
  it('should list items and sections of the container by position, tabs aside', () => {
    expect(
      getNavigationMenuContainerChildrenInPositionOrder({
        items: [
          {
            id: 'sales',
            type: NavigationMenuItemType.SECTION,
            parentId: null,
            position: 1,
          },
          {
            id: 'tab',
            type: NavigationMenuItemType.TAB,
            parentId: null,
            position: 0,
          },
          {
            id: 'companies',
            type: NavigationMenuItemType.OBJECT,
            parentId: null,
            position: 2,
          },
          {
            id: 'people',
            type: NavigationMenuItemType.OBJECT,
            parentId: null,
            position: 0,
          },
          {
            id: 'in-sales',
            type: NavigationMenuItemType.OBJECT,
            parentId: 'sales',
            position: 0,
          },
        ],
        containerId: null,
      }).map(({ id }) => id),
    ).toEqual(['people', 'sales', 'companies']);
  });

  it('should keep an item before a section sharing its position', () => {
    expect(
      getNavigationMenuContainerChildrenInPositionOrder({
        items: [
          {
            id: 'sales',
            type: NavigationMenuItemType.SECTION,
            parentId: null,
            position: 1,
          },
          {
            id: 'companies',
            type: NavigationMenuItemType.OBJECT,
            parentId: null,
            position: 1,
          },
        ],
        containerId: null,
      }).map(({ id }) => id),
    ).toEqual(['companies', 'sales']);
  });
});
