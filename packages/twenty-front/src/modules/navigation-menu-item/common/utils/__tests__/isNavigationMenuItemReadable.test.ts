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
        objectMetadataItems: [],
        views: [],
        objectPermissionsByObjectMetadataId: {},
      }),
    ).toBe(false);
  });
});
