import { NavigationMenuItemType } from 'twenty-shared/types';

import { buildFavoritesNavigationMenuSectionToCreate } from 'src/database/commands/upgrade-version-command/2-61/utils/build-favorites-navigation-menu-section-to-create.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

const buildItem = (
  overrides: Partial<FlatNavigationMenuItem>,
): FlatNavigationMenuItem =>
  ({
    id: 'item',
    universalIdentifier: 'item',
    type: NavigationMenuItemType.SECTION,
    userWorkspaceId: null,
    parentId: null,
    position: 0,
    builtInSectionKey: null,
    applicationId: 'standard-app',
    ...overrides,
  }) as FlatNavigationMenuItem;

const build = (navigationMenuItems: FlatNavigationMenuItem[]) =>
  buildFavoritesNavigationMenuSectionToCreate({
    navigationMenuItems,
    sectionId: 'favorites-section',
    twentyStandardApplicationId: 'standard-app',
    workspaceId: 'workspace',
    now: '2026-11-20T00:00:00.000Z',
  });

describe('buildFavoritesNavigationMenuSectionToCreate', () => {
  it('should create the Favorites section above every Home root item', () => {
    expect(
      build([
        buildItem({ id: 'workspace-section', position: 0 }),
        buildItem({
          id: 'home-object',
          type: NavigationMenuItemType.OBJECT,
          position: -3,
        }),
        buildItem({ id: 'favorite', userWorkspaceId: 'member', position: -9 }),
        buildItem({ id: 'tab-child', parentId: 'tab', position: -7 }),
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

  it('should skip a workspace that already has the standard Favorites section, even hidden', () => {
    expect(
      build([
        buildItem({
          universalIdentifier:
            STANDARD_NAVIGATION_MENU_ITEMS.favoritesSection.universalIdentifier,
          isActive: false,
        }),
      ]),
    ).toBeNull();
  });

  it('should skip a workspace that already shows a Favorites section on Home', () => {
    expect(build([buildItem({ builtInSectionKey: 'favorites' })])).toBeNull();
  });

  it('should still add it when Favorites only sits in a tab', () => {
    expect(
      build([buildItem({ builtInSectionKey: 'favorites', parentId: 'tab' })]),
    ).not.toBeNull();
  });
});
