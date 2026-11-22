import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuContainerBlocks } from '@/navigation-menu-item/common/utils/getNavigationMenuContainerBlocks';
import { sortNavigationMenuContainerChildren } from '@/navigation-menu-item/common/utils/sortNavigationMenuContainerChildren';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const buildItem = (
  id: string,
  type: NavigationMenuItemType,
  position: number,
): NavigationMenuItem => ({
  __typename: 'NavigationMenuItem',
  id,
  type,
  position,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

describe('getNavigationMenuContainerBlocks', () => {
  it('should interleave sections with runs of items by position', () => {
    const sortedChildren = sortNavigationMenuContainerChildren({
      items: [
        buildItem('people', NavigationMenuItemType.OBJECT, 3),
        buildItem('companies', NavigationMenuItemType.OBJECT, 0),
        buildItem('tasks', NavigationMenuItemType.OBJECT, 4),
      ],
      sections: [
        buildItem('sales', NavigationMenuItemType.SECTION, 1),
        buildItem('support', NavigationMenuItemType.SECTION, 2),
      ],
    });

    expect(
      getNavigationMenuContainerBlocks(sortedChildren).map((block) =>
        block.kind === 'items'
          ? block.items.map(({ id }) => id)
          : block.section.id,
      ),
    ).toEqual([['companies'], 'sales', 'support', ['people', 'tasks']]);
  });

  it('should keep items before a section sharing their position', () => {
    expect(
      sortNavigationMenuContainerChildren({
        items: [buildItem('companies', NavigationMenuItemType.OBJECT, 1)],
        sections: [buildItem('sales', NavigationMenuItemType.SECTION, 1)],
      }).map(({ id }) => id),
    ).toEqual(['companies', 'sales']);
  });
});
