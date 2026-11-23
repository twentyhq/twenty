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

const buildNavigationMenuItem = (
  properties: Pick<NavigationMenuItem, 'id' | 'type' | 'position'> &
    Partial<Pick<NavigationMenuItem, 'parentId'>>,
): NavigationMenuItem => ({
  isActive: true,
  createdAt: '2026-11-19T00:00:00.000Z',
  updatedAt: '2026-11-19T00:00:00.000Z',
  ...properties,
});

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

  it('lists the top-level items with the items of the root section', () => {
    const section = buildNavigationMenuItem({
      id: 'workspace-section',
      type: NavigationMenuItemType.SECTION,
      position: 0,
    });
    const folderInSection = buildNavigationMenuItem({
      id: 'folder-in-section',
      type: NavigationMenuItemType.FOLDER,
      parentId: section.id,
      position: 1,
    });
    const topLevelFolder = buildNavigationMenuItem({
      id: 'top-level-folder',
      type: NavigationMenuItemType.FOLDER,
      position: 2,
    });

    const result = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: [section, folderInSection, topLevelFolder],
      workspaceNavigationMenuItemsSorted: [],
      objectMetadataItems: [],
      views: [],
      objectPermissionsByObjectMetadataId: {},
      containerId: section.id,
      shouldIncludeTopLevelItems: true,
    });

    expect(result.map(({ id, parentId }) => ({ id, parentId }))).toEqual([
      { id: 'folder-in-section', parentId: section.id },
      { id: 'top-level-folder', parentId: section.id },
    ]);
  });
});
