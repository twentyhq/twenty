import { NavigationMenuItemType } from 'twenty-shared/types';

import { buildWorkspaceNavigationMenuSectionOperations } from 'src/database/commands/upgrade-version-command/2-61/utils/build-workspace-navigation-menu-section-operations.util';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

const buildItem = (
  overrides: Partial<FlatNavigationMenuItem>,
): FlatNavigationMenuItem =>
  ({
    id: 'item',
    universalIdentifier: 'item',
    type: NavigationMenuItemType.OBJECT,
    userWorkspaceId: null,
    parentId: null,
    position: 0,
    applicationId: 'custom-app',
    ...overrides,
  }) as FlatNavigationMenuItem;

const build = (navigationMenuItems: FlatNavigationMenuItem[]) =>
  buildWorkspaceNavigationMenuSectionOperations({
    navigationMenuItems,
    sectionId: 'section',
    sectionName: 'Workspace',
    movableApplicationIds: new Set(['custom-app', 'standard-app']),
    ownerApplication: {
      id: 'standard-app',
      universalIdentifier: 'standard-app-uid',
    },
    workspaceId: 'workspace',
    now: '2026-11-17T00:00:00.000Z',
  });

describe('buildWorkspaceNavigationMenuSectionOperations', () => {
  it('should create the section above the root items and move shared root items into it', () => {
    const { flatEntityToCreate, flatEntityToUpdate } = build([
      buildItem({ id: 'object', universalIdentifier: 'object', position: 2 }),
      buildItem({
        id: 'folder',
        universalIdentifier: 'folder',
        type: NavigationMenuItemType.FOLDER,
        position: 3,
      }),
      buildItem({
        id: 'tab',
        universalIdentifier: 'tab',
        type: NavigationMenuItemType.TAB,
      }),
      buildItem({ id: 'favorite', userWorkspaceId: 'member' }),
      buildItem({ id: 'app-item', applicationId: 'installed-app' }),
      buildItem({ id: 'child', parentId: 'folder' }),
    ]);

    expect(flatEntityToCreate).toHaveLength(1);
    expect(flatEntityToCreate[0]).toMatchObject({
      id: 'section',
      type: NavigationMenuItemType.SECTION,
      universalIdentifier:
        STANDARD_NAVIGATION_MENU_ITEMS.workspaceSection.universalIdentifier,
      position: -1,
      parentId: null,
      applicationId: 'standard-app',
    });
    expect(flatEntityToUpdate.map((item) => item.id)).toEqual([
      'object',
      'folder',
    ]);
    expect(flatEntityToUpdate[0].parentId).toBe('section');
  });

  it('should do nothing when the section already exists', () => {
    expect(
      build([
        buildItem({
          universalIdentifier:
            STANDARD_NAVIGATION_MENU_ITEMS.workspaceSection.universalIdentifier,
          type: NavigationMenuItemType.SECTION,
        }),
        buildItem({ id: 'object', universalIdentifier: 'object' }),
      ]),
    ).toEqual({ flatEntityToCreate: [], flatEntityToUpdate: [] });
  });
});
