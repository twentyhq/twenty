import { NavigationMenuItemType } from 'twenty-shared/types';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { resolveNavigationMenuItemDroppableId } from '@/navigation-menu-item/common/utils/resolveNavigationMenuItemDroppableId';

const ITEMS_BY_ID: Record<string, { type: NavigationMenuItemType }> = {
  'section-1': { type: NavigationMenuItemType.SECTION },
  'tab-1': { type: NavigationMenuItemType.TAB },
  'folder-1': { type: NavigationMenuItemType.FOLDER },
};

const resolve = (droppableId: string) =>
  resolveNavigationMenuItemDroppableId({
    droppableId,
    navigationMenuItemSection: 'workspace',
    getNavigationMenuItemById: (id) => ITEMS_BY_ID[id],
  });

describe('resolveNavigationMenuItemDroppableId', () => {
  it('should resolve the top-level list to the root', () => {
    expect(
      resolve(
        NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
      ),
    ).toEqual({ kind: 'root', parentId: null });
  });

  it('should resolve a tab or section list from its parent type', () => {
    expect(
      resolve(
        `${NavigationMenuItemDroppableIds.WORKSPACE_LIST_PREFIX}section-1`,
      ),
    ).toEqual({ kind: 'tabOrSectionList', parentId: 'section-1' });
    expect(
      resolve(`${NavigationMenuItemDroppableIds.WORKSPACE_LIST_PREFIX}tab-1`),
    ).toEqual({ kind: 'tabOrSectionList', parentId: 'tab-1' });
  });

  it('should resolve a folder list from its parent type', () => {
    expect(
      resolve(
        `${NavigationMenuItemDroppableIds.WORKSPACE_LIST_PREFIX}folder-1`,
      ),
    ).toEqual({ kind: 'folder', parentId: 'folder-1' });
  });

  it('should not resolve a list whose parent is unknown', () => {
    expect(
      resolve(`${NavigationMenuItemDroppableIds.WORKSPACE_LIST_PREFIX}missing`),
    ).toBeNull();
  });

  it('should resolve a folder header', () => {
    expect(
      resolve(
        `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX}folder-1`,
      ),
    ).toEqual({ kind: 'folderHeader', parentId: 'folder-1' });
  });

  it('should not resolve an id from another section', () => {
    expect(
      resolve(`${NavigationMenuItemDroppableIds.FAVORITE_LIST_PREFIX}folder-1`),
    ).toBeNull();
  });
});
