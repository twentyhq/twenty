import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { extractContainerIdFromDroppableId } from '@/navigation-menu-item/common/utils/extractContainerIdFromDroppableId';
import { getNavigationMenuItemContainerDroppableId } from '@/navigation-menu-item/common/utils/getNavigationMenuItemContainerDroppableId';

describe('extractContainerIdFromDroppableId', () => {
  it('places items dropped at the root of Home without a parent', () => {
    expect(
      extractContainerIdFromDroppableId(
        getNavigationMenuItemContainerDroppableId(null),
        'workspace',
      ),
    ).toBeNull();
  });

  it('places items dropped in a tab or section under that container', () => {
    expect(
      extractContainerIdFromDroppableId(
        getNavigationMenuItemContainerDroppableId('section-id'),
        'workspace',
      ),
    ).toBe('section-id');
  });

  it('places items dropped in a folder under that folder', () => {
    expect(
      extractContainerIdFromDroppableId(
        `${NavigationMenuItemDroppableIds.WORKSPACE_FOLDER_PREFIX}folder-id`,
        'workspace',
      ),
    ).toBe('folder-id');
  });
});
