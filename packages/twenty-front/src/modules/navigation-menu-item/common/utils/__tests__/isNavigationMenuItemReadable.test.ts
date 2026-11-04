import { PermissionFlagType } from 'twenty-shared/constants';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { isNavigationMenuItemReadable } from '@/navigation-menu-item/common/utils/isNavigationMenuItemReadable';

describe('isNavigationMenuItemReadable', () => {
  it('keeps native page items, which do not depend on an object', () => {
    expect(
      isNavigationMenuItemReadable({
        item: {
          id: 'workflows-native-page-id',
          type: NavigationMenuItemType.NATIVE_PAGE,
          nativePageKey: 'workflows',
          position: 0,
          createdAt: '',
          updatedAt: '',
        },
        permissionFlagMap: { [PermissionFlagType.WORKFLOWS]: true },
        objectMetadataItems: [],
        views: [],
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(true);
  });

  it('hides a native page item from members without its permission', () => {
    expect(
      isNavigationMenuItemReadable({
        item: {
          id: 'data-model-native-page-id',
          type: NavigationMenuItemType.NATIVE_PAGE,
          nativePageKey: 'agents',
          position: 0,
          createdAt: '',
          updatedAt: '',
        },
        permissionFlagMap: { [PermissionFlagType.AI]: false },
        objectMetadataItems: [],
        views: [],
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(false);
  });

  it('hides a native page item when its permission is absent from the map', () => {
    expect(
      isNavigationMenuItemReadable({
        item: {
          id: 'agents-native-page-id',
          type: NavigationMenuItemType.NATIVE_PAGE,
          nativePageKey: 'agents',
          position: 0,
          createdAt: '',
          updatedAt: '',
        },
        permissionFlagMap: {},
        objectMetadataItems: [],
        views: [],
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(false);
  });

  it('hides an object item whose object is missing', () => {
    expect(
      isNavigationMenuItemReadable({
        item: {
          id: 'object-item-id',
          type: NavigationMenuItemType.OBJECT,
          targetObjectMetadataId: 'missing-object-id',
          position: 0,
          createdAt: '',
          updatedAt: '',
        },
        permissionFlagMap: {},
        objectMetadataItems: [],
        views: [],
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(false);
  });
});
