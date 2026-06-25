import { NavigationMenuItemType } from 'twenty-shared/types';

import { getReadableFavoriteNavigationMenuItems } from '@/navigation-menu-item/display/sections/favorites/utils/getReadableFavoriteNavigationMenuItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { ViewKey } from '@/views/types/ViewKey';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type ObjectPermissionsByObjectMetadataId = Parameters<
  typeof getObjectPermissionsForObject
>[0];

describe('getReadableFavoriteNavigationMenuItems', () => {
  const objectMetadataItems = [
    { id: 'readable-meta', isActive: true },
    { id: 'restricted-meta', isActive: true },
  ] as EnrichedObjectMetadataItem[];

  const buildPermissions = (
    objectMetadataId: string,
    canReadObjectRecords: boolean,
  ): ObjectPermissionsByObjectMetadataId[string] => ({
    objectMetadataId,
    canReadObjectRecords,
    canUpdateObjectRecords: canReadObjectRecords,
    canSoftDeleteObjectRecords: canReadObjectRecords,
    canDestroyObjectRecords: canReadObjectRecords,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  });

  const objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId =
    {
      'readable-meta': buildPermissions('readable-meta', true),
      'restricted-meta': buildPermissions('restricted-meta', false),
    };

  const callUtil = ({
    navigationMenuItemsSorted = [],
    userNavigationMenuItemsByFolder = [],
    views = [],
  }: {
    navigationMenuItemsSorted?: NavigationMenuItem[];
    userNavigationMenuItemsByFolder?: {
      id: string;
      navigationMenuItems: NavigationMenuItem[];
    }[];
    views?: ViewWithRelations[];
  }) =>
    getReadableFavoriteNavigationMenuItems({
      navigationMenuItemsSorted,
      userNavigationMenuItemsByFolder,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
    });

  it('should return empty results when there are no favorites', () => {
    const { topLevelItems, folderChildrenById } = callUtil({});

    expect(topLevelItems).toEqual([]);
    expect(folderChildrenById.size).toBe(0);
  });

  it('should keep object favorites the user can read and drop the ones they cannot', () => {
    const navigationMenuItemsSorted = [
      {
        id: 'fav-readable',
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: 'readable-meta',
        position: 1,
      },
      {
        id: 'fav-restricted',
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: 'restricted-meta',
        position: 2,
      },
    ] as NavigationMenuItem[];

    const { topLevelItems } = callUtil({ navigationMenuItemsSorted });

    expect(topLevelItems.map((item) => item.id)).toEqual(['fav-readable']);
  });

  it('should drop record favorites pointing to a restricted object', () => {
    const navigationMenuItemsSorted = [
      {
        id: 'fav-record',
        type: NavigationMenuItemType.RECORD,
        targetObjectMetadataId: 'restricted-meta',
        targetRecordId: 'record-id',
        targetRecordIdentifier: { id: 'record-id', labelIdentifier: 'John' },
        position: 1,
      },
    ] as NavigationMenuItem[];

    const { topLevelItems } = callUtil({ navigationMenuItemsSorted });

    expect(topLevelItems).toEqual([]);
  });

  it('should drop view favorites whose object is restricted', () => {
    const views = [
      {
        id: 'restricted-view',
        objectMetadataId: 'restricted-meta',
        key: ViewKey.INDEX,
      },
    ] as ViewWithRelations[];

    const navigationMenuItemsSorted = [
      {
        id: 'fav-view',
        type: NavigationMenuItemType.VIEW,
        viewId: 'restricted-view',
        position: 1,
      },
    ] as NavigationMenuItem[];

    const { topLevelItems } = callUtil({ navigationMenuItemsSorted, views });

    expect(topLevelItems).toEqual([]);
  });

  it('should always keep link favorites regardless of permissions', () => {
    const navigationMenuItemsSorted = [
      {
        id: 'fav-link',
        type: NavigationMenuItemType.LINK,
        link: 'https://example.com',
        position: 1,
      },
    ] as NavigationMenuItem[];

    const { topLevelItems } = callUtil({ navigationMenuItemsSorted });

    expect(topLevelItems.map((item) => item.id)).toEqual(['fav-link']);
  });

  it('should only keep readable children inside a folder and keep the folder', () => {
    const navigationMenuItemsSorted = [
      {
        id: 'folder-1',
        type: NavigationMenuItemType.FOLDER,
        position: 1,
      },
    ] as NavigationMenuItem[];

    const userNavigationMenuItemsByFolder = [
      {
        id: 'folder-1',
        navigationMenuItems: [
          {
            id: 'child-readable',
            type: NavigationMenuItemType.OBJECT,
            targetObjectMetadataId: 'readable-meta',
            folderId: 'folder-1',
            position: 1,
          },
          {
            id: 'child-restricted',
            type: NavigationMenuItemType.OBJECT,
            targetObjectMetadataId: 'restricted-meta',
            folderId: 'folder-1',
            position: 2,
          },
        ] as NavigationMenuItem[],
      },
    ];

    const { topLevelItems, folderChildrenById } = callUtil({
      navigationMenuItemsSorted,
      userNavigationMenuItemsByFolder,
    });

    expect(topLevelItems.map((item) => item.id)).toEqual(['folder-1']);
    expect(folderChildrenById.get('folder-1')?.map((item) => item.id)).toEqual([
      'child-readable',
    ]);
  });

  it('should drop a folder whose children are all restricted', () => {
    const navigationMenuItemsSorted = [
      {
        id: 'folder-1',
        type: NavigationMenuItemType.FOLDER,
        position: 1,
      },
    ] as NavigationMenuItem[];

    const userNavigationMenuItemsByFolder = [
      {
        id: 'folder-1',
        navigationMenuItems: [
          {
            id: 'child-restricted',
            type: NavigationMenuItemType.OBJECT,
            targetObjectMetadataId: 'restricted-meta',
            folderId: 'folder-1',
            position: 1,
          },
        ] as NavigationMenuItem[],
      },
    ];

    const { topLevelItems, folderChildrenById } = callUtil({
      navigationMenuItemsSorted,
      userNavigationMenuItemsByFolder,
    });

    expect(topLevelItems).toEqual([]);
    expect(folderChildrenById.get('folder-1')).toEqual([]);
  });
});
