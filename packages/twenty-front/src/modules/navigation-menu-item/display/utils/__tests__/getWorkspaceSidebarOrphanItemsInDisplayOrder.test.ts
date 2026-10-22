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

  it('lists only the items of the requested tab or section, without tabs and sections themselves', () => {
    const tab = {
      id: 'tab-id',
      type: NavigationMenuItemType.TAB,
      name: 'Developers',
      position: 0,
    } as NavigationMenuItem;
    const section = {
      id: 'section-id',
      type: NavigationMenuItemType.SECTION,
      name: 'Tools',
      folderId: 'tab-id',
      position: 0,
    } as NavigationMenuItem;
    const tabLink = {
      id: 'tab-link-id',
      type: NavigationMenuItemType.LINK,
      link: '/settings/developers',
      folderId: 'tab-id',
      position: 1,
    } as NavigationMenuItem;
    const workspaceItems = [tab, section, tabLink, objectBackedItem];

    const homeItems = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: workspaceItems,
      workspaceNavigationMenuItemsSorted: [objectBackedItem, tabLink],
      objectMetadataItems: [objectMetadataItem],
      views: [],
      objectPermissionsByObjectMetadataId: {},
      includeInaccessibleObjectBackedItems: true,
    });
    const tabItems = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: workspaceItems,
      workspaceNavigationMenuItemsSorted: [objectBackedItem, tabLink],
      objectMetadataItems: [objectMetadataItem],
      views: [],
      objectPermissionsByObjectMetadataId: {},
      includeInaccessibleObjectBackedItems: true,
      containerId: 'tab-id',
    });

    expect(homeItems.map((item) => item.id)).toEqual(['item-id']);
    expect(tabItems.map((item) => item.id)).toEqual(['tab-link-id']);
  });
});
