import { NavigationMenuItemType } from 'twenty-shared/types';

import { buildFavoritesNavigationMenuSectionToCreate } from 'src/database/commands/upgrade-version-command/2-64/utils/build-favorites-navigation-menu-section-to-create.util';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

const buildItem = (
  overrides: Partial<NavigationMenuItemFixture>,
): NavigationMenuItemFixture => ({
  universalIdentifier: 'item',
  userWorkspaceId: null,
  parentId: null,
  position: 0,
  builtInSectionKey: null,
  ...overrides,
});

const build = (navigationMenuItems: NavigationMenuItemFixture[]) =>
  buildFavoritesNavigationMenuSectionToCreate({
    navigationMenuItems,
    sectionId: 'favorites-section',
    twentyStandardApplication: {
      id: 'standard-app',
      universalIdentifier: 'standard-app-uid',
    },
    workspaceId: 'workspace',
    now: '2026-11-20T00:00:00.000Z',
  });

type NavigationMenuItemFixture = Parameters<
  typeof buildFavoritesNavigationMenuSectionToCreate
>[0]['navigationMenuItems'][number];

describe('buildFavoritesNavigationMenuSectionToCreate', () => {
  it('should create the Favorites section above every Home root item', () => {
    expect(
      build([
        buildItem({ universalIdentifier: 'workspace-section', position: 0 }),
        buildItem({ universalIdentifier: 'home-object', position: -3 }),
        buildItem({ userWorkspaceId: 'member', position: -9 }),
        buildItem({ parentId: 'tab', position: -7 }),
      ]),
    ).toMatchObject({
      id: 'favorites-section',
      type: NavigationMenuItemType.SECTION,
      universalIdentifier:
        STANDARD_NAVIGATION_MENU_ITEMS.favoritesSection.universalIdentifier,
      builtInSectionKey: 'favorites',
      name: null,
      parentId: null,
      userWorkspaceId: null,
      position: -4,
      isActive: true,
    });
  });

  it('should skip a workspace that already has the standard Favorites section', () => {
    expect(
      build([
        buildItem({
          universalIdentifier:
            STANDARD_NAVIGATION_MENU_ITEMS.favoritesSection.universalIdentifier,
        }),
      ]),
    ).toBeNull();
  });

  it('should skip a workspace that already shows a Favorites section on Home', () => {
    expect(build([buildItem({ builtInSectionKey: 'favorites' })])).toBeNull();
  });

  it('should skip a workspace whose Favorites section was moved into a tab', () => {
    expect(
      build([buildItem({ builtInSectionKey: 'favorites', parentId: 'tab' })]),
    ).toBeNull();
  });
});
