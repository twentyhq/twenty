import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemTargetInPlacementScope } from '@/navigation-menu-item/common/utils/isNavigationMenuItemTargetInPlacementScope';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const buildItem = (
  item: Pick<NavigationMenuItem, 'id' | 'type'> & Partial<NavigationMenuItem>,
): NavigationMenuItem => ({
  __typename: 'NavigationMenuItem',
  position: 0,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...item,
});

const items = [
  buildItem({ id: 'sales', type: NavigationMenuItemType.SECTION }),
  buildItem({ id: 'support', type: NavigationMenuItemType.SECTION }),
  buildItem({
    id: 'companies-in-sales',
    type: NavigationMenuItemType.OBJECT,
    targetObjectMetadataId: 'company',
    parentId: 'sales',
  }),
];

describe('isNavigationMenuItemTargetInPlacementScope', () => {
  it('should find the same target elsewhere in the section', () => {
    expect(
      isNavigationMenuItemTargetInPlacementScope({
        item: buildItem({
          id: 'hidden-companies',
          type: NavigationMenuItemType.OBJECT,
          targetObjectMetadataId: 'company',
          parentId: 'sales',
        }),
        items,
      }),
    ).toBe(true);
  });

  it('should ignore the same target in another section', () => {
    expect(
      isNavigationMenuItemTargetInPlacementScope({
        item: buildItem({
          id: 'hidden-companies',
          type: NavigationMenuItemType.OBJECT,
          targetObjectMetadataId: 'company',
          parentId: 'support',
        }),
        items,
      }),
    ).toBe(false);
  });
});
