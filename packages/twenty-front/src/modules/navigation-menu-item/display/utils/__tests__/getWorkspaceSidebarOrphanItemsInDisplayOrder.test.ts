import { NavigationMenuItemType } from 'twenty-shared/types';

import { getWorkspaceSidebarOrphanItemsInDisplayOrder } from '@/navigation-menu-item/display/utils/getWorkspaceSidebarOrphanItemsInDisplayOrder';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const objectMetadataItem = {
  id: 'object-id',
  nameSingular: 'workflow',
  isActive: true,
} as EnrichedObjectMetadataItem;

const readablePermissions = {
  'object-id': {
    objectMetadataId: 'object-id',
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
  },
} as unknown as Parameters<
  typeof getWorkspaceSidebarOrphanItemsInDisplayOrder
>[0]['objectPermissionsByObjectMetadataId'];

const folder = {
  id: 'folder-id',
  type: NavigationMenuItemType.FOLDER,
  folderId: null,
  position: 0,
} as NavigationMenuItem;

const childInFolder = {
  id: 'child-id',
  type: NavigationMenuItemType.OBJECT,
  targetObjectMetadataId: 'object-id',
  folderId: 'folder-id',
  position: 0,
} as NavigationMenuItem;

const views: ViewWithRelations[] = [];

// Folders are emitted straight from the raw list here, so nothing downstream
// reconsiders them. A folder left with no children a viewer may see has to be
// dropped at this point or it renders as a row that opens onto nothing —
// which is exactly how the Workflows folder survived two attempts to hide it.
describe('getWorkspaceSidebarOrphanItemsInDisplayOrder', () => {
  it('should drop a folder whose every child was filtered out for this viewer', () => {
    const result = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: [folder, childInFolder],
      workspaceNavigationMenuItemsSorted: [],
      objectMetadataItems: [objectMetadataItem],
      views,
      objectPermissionsByObjectMetadataId: readablePermissions,
    });

    expect(result).toEqual([]);
  });

  it('should keep a folder that still has a visible child', () => {
    const result = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: [folder, childInFolder],
      workspaceNavigationMenuItemsSorted: [childInFolder],
      objectMetadataItems: [objectMetadataItem],
      views,
      objectPermissionsByObjectMetadataId: readablePermissions,
    });

    expect(result.map((item) => item.id)).toEqual(['folder-id']);
  });

  it('should keep a folder that has no children at all', () => {
    const result = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: [folder],
      workspaceNavigationMenuItemsSorted: [],
      objectMetadataItems: [objectMetadataItem],
      views,
      objectPermissionsByObjectMetadataId: readablePermissions,
    });

    expect(result.map((item) => item.id)).toEqual(['folder-id']);
  });

  it('should keep an emptied folder in layout customization mode', () => {
    const result = getWorkspaceSidebarOrphanItemsInDisplayOrder({
      workspaceNavigationMenuItems: [folder, childInFolder],
      workspaceNavigationMenuItemsSorted: [],
      objectMetadataItems: [objectMetadataItem],
      views,
      objectPermissionsByObjectMetadataId: readablePermissions,
      includeInaccessibleObjectBackedItems: true,
    });

    expect(result.map((item) => item.id)).toEqual(['folder-id']);
  });
});
