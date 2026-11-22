import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuContainerBlocks } from '@/navigation-menu-item/common/utils/getNavigationMenuContainerBlocks';
import { sortNavigationMenuContainerChildren } from '@/navigation-menu-item/common/utils/sortNavigationMenuContainerChildren';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const buildItem = ({
  id,
  type,
  position,
}: Pick<
  NavigationMenuItem,
  'id' | 'type' | 'position'
>): NavigationMenuItem => ({
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
        buildItem({
          id: 'people',
          type: NavigationMenuItemType.OBJECT,
          position: 3,
        }),
        buildItem({
          id: 'companies',
          type: NavigationMenuItemType.OBJECT,
          position: 0,
        }),
        buildItem({
          id: 'tasks',
          type: NavigationMenuItemType.OBJECT,
          position: 4,
        }),
      ],
      sections: [
        buildItem({
          id: 'sales',
          type: NavigationMenuItemType.SECTION,
          position: 1,
        }),
        buildItem({
          id: 'support',
          type: NavigationMenuItemType.SECTION,
          position: 2,
        }),
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
        items: [
          buildItem({
            id: 'companies',
            type: NavigationMenuItemType.OBJECT,
            position: 1,
          }),
        ],
        sections: [
          buildItem({
            id: 'sales',
            type: NavigationMenuItemType.SECTION,
            position: 1,
          }),
        ],
      }).map(({ id }) => id),
    ).toEqual(['companies', 'sales']);
  });
});
