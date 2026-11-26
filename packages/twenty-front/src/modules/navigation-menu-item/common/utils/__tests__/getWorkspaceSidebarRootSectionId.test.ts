import { STANDARD_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

import { getWorkspaceSidebarRootSectionId } from '@/navigation-menu-item/common/utils/getWorkspaceSidebarRootSectionId';

describe('getWorkspaceSidebarRootSectionId', () => {
  it('should return the standard Workspace section', () => {
    expect(
      getWorkspaceSidebarRootSectionId([
        {
          id: 'app-section',
          universalIdentifier: 'app-section-universal-identifier',
        },
        {
          id: 'workspace-section',
          universalIdentifier:
            STANDARD_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS.workspaceSection
              .universalIdentifier,
        },
      ]),
    ).toBe('workspace-section');
  });

  it('should return null without the standard Workspace section', () => {
    expect(
      getWorkspaceSidebarRootSectionId([
        {
          id: 'app-section',
          universalIdentifier: 'app-section-universal-identifier',
        },
      ]),
    ).toBeNull();
  });

  it('should ignore the Workspace section once it sits under a tab', () => {
    expect(
      getWorkspaceSidebarRootSectionId([
        {
          id: 'workspace-section',
          parentId: 'tab',
          universalIdentifier:
            STANDARD_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS.workspaceSection
              .universalIdentifier,
        },
      ]),
    ).toBeNull();
  });
});
