import { PermissionFlagType } from 'twenty-shared/constants';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

describe('isNavigationMenuItemReadable', () => {
  it('keeps system page items, which do not depend on an object', () => {
    expect(
      isNavigationMenuItemReadable({
        item: {
          id: 'workflows-system-page-id',
          type: NavigationMenuItemType.SYSTEM_PAGE,
          systemPageKey: 'workflows',
          position: 0,
        } as NavigationMenuItem,
        permissionFlagMap: { [PermissionFlagType.WORKFLOWS]: true },
        objectMetadataItems: [],
        views: [],
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(true);
  });

  it('hides a system page item from members without its permission', () => {
    expect(
      isNavigationMenuItemReadable({
        item: {
          id: 'data-model-system-page-id',
          type: NavigationMenuItemType.SYSTEM_PAGE,
          systemPageKey: 'dataModel',
          position: 0,
        } as NavigationMenuItem,
        permissionFlagMap: { [PermissionFlagType.DATA_MODEL]: false },
        objectMetadataItems: [],
        views: [],
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(false);
  });

  it('shows a system page item that needs no permission', () => {
    expect(
      isNavigationMenuItemReadable({
        item: {
          id: 'agents-system-page-id',
          type: NavigationMenuItemType.SYSTEM_PAGE,
          systemPageKey: 'agents',
          position: 0,
        } as NavigationMenuItem,
        permissionFlagMap: {},
        objectMetadataItems: [],
        views: [],
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(true);
  });

  it('hides an object item whose object is missing', () => {
    expect(
      isNavigationMenuItemReadable({
        item: {
          id: 'object-item-id',
          type: NavigationMenuItemType.OBJECT,
          targetObjectMetadataId: 'missing-object-id',
          position: 0,
        } as NavigationMenuItem,
        permissionFlagMap: {},
        objectMetadataItems: [],
        views: [],
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(false);
  });
});
