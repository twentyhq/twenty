import { NavigationMenuItemType } from 'twenty-shared/types';

import { filterReadableNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterReadableNavigationMenuItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { ViewKey } from '@/views/types/ViewKey';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type ObjectPermissionsByObjectMetadataId = Parameters<
  typeof getObjectPermissionsForObject
>[0];

describe('filterReadableNavigationMenuItems', () => {
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

  const filter = (
    navigationMenuItems: NavigationMenuItem[],
    views: ViewWithRelations[] = [],
  ) =>
    filterReadableNavigationMenuItems({
      navigationMenuItems,
      objectMetadataItems,
      views,
      objectPermissionsByObjectMetadataId,
    });

  it('should keep object items the user can read and drop the ones they cannot', () => {
    const items = [
      {
        id: 'readable',
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: 'readable-meta',
      },
      {
        id: 'restricted',
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: 'restricted-meta',
      },
    ] as NavigationMenuItem[];

    expect(filter(items).map((item) => item.id)).toEqual(['readable']);
  });

  it('should drop record items pointing to a restricted object', () => {
    const items = [
      {
        id: 'record',
        type: NavigationMenuItemType.RECORD,
        targetObjectMetadataId: 'restricted-meta',
        targetRecordId: 'record-id',
        targetRecordIdentifier: { id: 'record-id', labelIdentifier: 'John' },
      },
    ] as NavigationMenuItem[];

    expect(filter(items)).toEqual([]);
  });

  it('should drop view items whose object is restricted', () => {
    const views = [
      {
        id: 'restricted-view',
        objectMetadataId: 'restricted-meta',
        key: ViewKey.INDEX,
      },
    ] as ViewWithRelations[];

    const items = [
      {
        id: 'view',
        type: NavigationMenuItemType.VIEW,
        viewId: 'restricted-view',
      },
    ] as NavigationMenuItem[];

    expect(filter(items, views)).toEqual([]);
  });

  it('should always keep folder and link items regardless of permissions', () => {
    const items = [
      { id: 'folder', type: NavigationMenuItemType.FOLDER },
      {
        id: 'link',
        type: NavigationMenuItemType.LINK,
        link: 'https://example.com',
      },
    ] as NavigationMenuItem[];

    expect(filter(items).map((item) => item.id)).toEqual(['folder', 'link']);
  });
});
