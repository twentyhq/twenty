import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { extractFolderIdFromDroppableId } from '@/navigation-menu-item/common/utils/extractFolderIdFromDroppableId';
import { getNavigationMenuItemContainerDroppableId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemContainerDroppableId';

describe('extractFolderIdFromDroppableId', () => {
  it('places items dropped at the root of Home without a parent', () => {
    expect(
      extractFolderIdFromDroppableId(
        getNavigationMenuItemContainerDroppableId(null),
        'workspace',
      ),
    ).toBeNull();
  });

  it('places items dropped in a tab or section under that container', () => {
    expect(
      extractFolderIdFromDroppableId(
        getNavigationMenuItemContainerDroppableId('section-id'),
        'workspace',
      ),
    ).toBe('section-id');
  });

  it('places items dropped in a folder under that folder', () => {
    expect(
      extractFolderIdFromDroppableId(
        `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX}folder-id`,
        'workspace',
      ),
    ).toBe('folder-id');
  });
});
