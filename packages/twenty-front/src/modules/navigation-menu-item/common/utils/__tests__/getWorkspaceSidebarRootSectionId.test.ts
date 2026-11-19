import { NavigationMenuItemType } from 'twenty-shared/types';

import { getWorkspaceSidebarRootSectionId } from '@/navigation-menu-item/common/utils/getWorkspaceSidebarRootSectionId';

describe('getWorkspaceSidebarRootSectionId', () => {
  it('should return the first top-level section', () => {
    expect(
      getWorkspaceSidebarRootSectionId([
        { id: 'tab', type: NavigationMenuItemType.TAB, position: 0 },
        {
          id: 'section-in-tab',
          type: NavigationMenuItemType.SECTION,
          parentId: 'tab',
          position: 0,
        },
        {
          id: 'second-section',
          type: NavigationMenuItemType.SECTION,
          position: 2,
        },
        {
          id: 'workspace-section',
          type: NavigationMenuItemType.SECTION,
          position: 1,
        },
      ]),
    ).toBe('workspace-section');
  });

  it('should return null without a top-level section', () => {
    expect(
      getWorkspaceSidebarRootSectionId([
        { id: 'object', type: NavigationMenuItemType.OBJECT, position: 0 },
      ]),
    ).toBeNull();
  });
});
