import { NavigationMenuItemType } from 'twenty-shared/types';

import { getWorkspaceSidebarRootSectionId } from '@/navigation-menu-item/common/utils/getWorkspaceSidebarRootSectionId';

const STANDARD_APPLICATION_ID = 'standard-application';

describe('getWorkspaceSidebarRootSectionId', () => {
  it('should return the top-level section of the standard application', () => {
    expect(
      getWorkspaceSidebarRootSectionId({
        navigationMenuItems: [
          {
            id: 'custom-section',
            type: NavigationMenuItemType.SECTION,
            applicationId: 'custom-application',
          },
          {
            id: 'workspace-section',
            type: NavigationMenuItemType.SECTION,
            applicationId: STANDARD_APPLICATION_ID,
          },
        ],
        standardApplicationId: STANDARD_APPLICATION_ID,
      }),
    ).toBe('workspace-section');
  });

  it('should return null without a standard top-level section', () => {
    expect(
      getWorkspaceSidebarRootSectionId({
        navigationMenuItems: [
          {
            id: 'custom-section',
            type: NavigationMenuItemType.SECTION,
            applicationId: 'custom-application',
          },
        ],
        standardApplicationId: STANDARD_APPLICATION_ID,
      }),
    ).toBeNull();
  });
});
