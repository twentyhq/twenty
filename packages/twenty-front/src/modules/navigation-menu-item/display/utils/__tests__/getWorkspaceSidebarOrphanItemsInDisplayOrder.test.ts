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

  it('returns only the direct children of a container, without tabs or sections', () => {
    const sectionId = 'section-id';
    const folderInSection = {
      id: 'folder-id',
      type: NavigationMenuItemType.FOLDER,
      parentId: sectionId,
      position: 1,
    } as NavigationMenuItem;
    const section = {
      id: sectionId,
      type: NavigationMenuItemType.SECTION,
      position: 0,
    } as NavigationMenuItem;
    const tab = {
      id: 'tab-id',
      type: NavigationMenuItemType.TAB,
      position: 0,
    } as NavigationMenuItem;
    const workspaceNavigationMenuItems = [
      section,
      tab,
      folderInSection,
      objectBackedItem,
    ];

    const sectionResult = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems,
      workspaceNavigationMenuItemsSorted: [objectBackedItem],
      objectMetadataItems: [objectMetadataItem],
      views: [],
      objectPermissionsByObjectMetadataId: {},
      containerId: sectionId,
    });

    const rootResult = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems,
      workspaceNavigationMenuItemsSorted: [objectBackedItem],
      objectMetadataItems: [objectMetadataItem],
      views: [],
      objectPermissionsByObjectMetadataId: {},
    });

    expect(sectionResult.map((item) => item.id)).toEqual(['folder-id']);
    expect(rootResult.map((item) => item.id)).toEqual(['item-id']);
  });
});
