import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { resolveNavigationMenuItemDroppableId } from '@/navigation-menu-item/common/utils/resolveNavigationMenuItemDroppableId';

describe('resolveNavigationMenuItemDroppableId', () => {
  it('should resolve the top-level list to the root', () => {
    expect(
      resolveNavigationMenuItemDroppableId(
        NavigationMenuItemDroppableIds.WORKSPACE_ORPHAN_NAVIGATION_MENU_ITEMS,
        'workspace',
      ),
    ).toEqual({ kind: 'root', parentId: null });
  });

  it('should resolve a tab or section list to its parent', () => {
    expect(
      resolveNavigationMenuItemDroppableId(
        `${NavigationMenuItemDroppableIds.WORKSPACE_TAB_OR_SECTION_LIST_PREFIX}section-1`,
        'workspace',
      ),
    ).toEqual({ kind: 'tabOrSectionList', parentId: 'section-1' });
  });

  it('should tell a folder header apart from folder content', () => {
    expect(
      resolveNavigationMenuItemDroppableId(
        `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_HEADER_PREFIX}folder-1`,
        'workspace',
      ),
    ).toEqual({ kind: 'folderHeader', parentId: 'folder-1' });
    expect(
      resolveNavigationMenuItemDroppableId(
        `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX}folder-1`,
        'workspace',
      ),
    ).toEqual({ kind: 'folder', parentId: 'folder-1' });
  });

  it('should not resolve tab or section lists in favorites', () => {
    expect(
      resolveNavigationMenuItemDroppableId(
        `${NavigationMenuItemDroppableIds.WORKSPACE_TAB_OR_SECTION_LIST_PREFIX}section-1`,
        'favorite',
      ),
    ).toBeNull();
  });
});
