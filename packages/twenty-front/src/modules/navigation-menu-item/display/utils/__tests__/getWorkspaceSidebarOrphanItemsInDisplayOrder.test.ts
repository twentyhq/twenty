import { NavigationMenuItemType } from 'twenty-shared/types';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getWorkspaceSidebarOrphanItemsInDisplayOrder } from '@/navigation-menu-item/display/utils/getWorkspaceSidebarOrphanItemsInDisplayOrder';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const objectMetadataItem = {
  id: 'metadata-id',
  nameSingular: 'workflow',
  isActive: true,
} as EnrichedObjectMetadataItem;

const objectBackedItem = {
  id: 'item-id',
  type: NavigationMenuItemType.OBJECT,
  targetObjectMetadataId: 'metadata-id',
  position: 1,
} as NavigationMenuItem;

const hiddenObjectBackedItem = {
  id: 'hidden-item-id',
  type: NavigationMenuItemType.OBJECT,
  targetObjectMetadataId: 'hidden-metadata-id',
  position: 2,
} as NavigationMenuItem;

describe('getWorkspaceSidebarOrphanItemsInDisplayOrder', () => {
  it('drops an object-backed item whose object is absent from the metadata in customization mode', () => {
    const result = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: [hiddenObjectBackedItem],
      workspaceNavigationMenuItemsSorted: [],
      objectMetadataItems: [objectMetadataItem],
      views: [],
      objectPermissionsByObjectMetadataId: {},
      includeInaccessibleObjectBackedItems: true,
    });

    expect(result).toEqual([]);
  });

  it('keeps an object-backed item whose object is present in customization mode even when it is not in the sorted list', () => {
    const result = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: [objectBackedItem],
      workspaceNavigationMenuItemsSorted: [],
      objectMetadataItems: [objectMetadataItem],
      views: [],
      objectPermissionsByObjectMetadataId: {},
      includeInaccessibleObjectBackedItems: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item-id');
  });

  it('keeps a readable object-backed item in normal mode', () => {
    const result = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: [objectBackedItem],
      workspaceNavigationMenuItemsSorted: [objectBackedItem],
      objectMetadataItems: [objectMetadataItem],
      views: [],
      objectPermissionsByObjectMetadataId: {},
      includeInaccessibleObjectBackedItems: false,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item-id');
  });
});
