import { NavigationMenuItemType } from 'twenty-shared/types';

import { canPlaceNavigationMenuItemInContainer } from '@/navigation-menu-item/common/utils/canPlaceNavigationMenuItemInContainer';
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
  buildItem({ id: 'tab', type: NavigationMenuItemType.TAB, name: 'Sales' }),
  buildItem({
    id: 'sales-section',
    type: NavigationMenuItemType.SECTION,
    parentId: 'tab',
  }),
  buildItem({
    id: 'support-section',
    type: NavigationMenuItemType.SECTION,
    parentId: 'tab',
  }),
  buildItem({
    id: 'folder',
    type: NavigationMenuItemType.FOLDER,
    parentId: 'sales-section',
  }),
  buildItem({
    id: 'companies-in-sales',
    type: NavigationMenuItemType.OBJECT,
    targetObjectMetadataId: 'company',
    parentId: 'folder',
  }),
  buildItem({
    id: 'companies-in-support',
    type: NavigationMenuItemType.OBJECT,
    targetObjectMetadataId: 'company',
    parentId: 'support-section',
  }),
  buildItem({
    id: 'people-in-support',
    type: NavigationMenuItemType.OBJECT,
    targetObjectMetadataId: 'person',
    parentId: 'support-section',
  }),
];

describe('canPlaceNavigationMenuItemInContainer', () => {
  it('should refuse a section that already holds the same target', () => {
    expect(
      canPlaceNavigationMenuItemInContainer({
        itemId: 'companies-in-support',
        containerId: 'sales-section',
        items,
      }),
    ).toBe(false);
  });

  it('should refuse a folder whose child duplicates a target of the destination', () => {
    expect(
      canPlaceNavigationMenuItemInContainer({
        itemId: 'folder',
        containerId: 'support-section',
        items,
      }),
    ).toBe(false);
  });

  it('should accept a target that is only in another section of the same tab', () => {
    expect(
      canPlaceNavigationMenuItemInContainer({
        itemId: 'people-in-support',
        containerId: 'sales-section',
        items,
      }),
    ).toBe(true);
    expect(
      canPlaceNavigationMenuItemInContainer({
        itemId: 'companies-in-support',
        containerId: 'tab',
        items,
      }),
    ).toBe(true);
  });

  it('should accept moves inside the same section', () => {
    expect(
      canPlaceNavigationMenuItemInContainer({
        itemId: 'companies-in-sales',
        containerId: 'sales-section',
        items,
      }),
    ).toBe(true);
  });

  it('should always accept sections', () => {
    expect(
      canPlaceNavigationMenuItemInContainer({
        itemId: 'support-section',
        containerId: null,
        items,
      }),
    ).toBe(true);
  });
});
