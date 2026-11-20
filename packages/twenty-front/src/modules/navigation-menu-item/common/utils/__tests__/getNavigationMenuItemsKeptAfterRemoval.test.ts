import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuItemsKeptAfterRemoval } from '@/navigation-menu-item/common/utils/getNavigationMenuItemsKeptAfterRemoval';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const buildNavigationMenuItem = (
  properties: Pick<NavigationMenuItem, 'id'> &
    Partial<Pick<NavigationMenuItem, 'type' | 'parentId' | 'isActive'>>,
): NavigationMenuItem => ({
  type: NavigationMenuItemType.OBJECT,
  position: 0,
  isActive: true,
  createdAt: '2026-11-20T00:00:00.000Z',
  updatedAt: '2026-11-20T00:00:00.000Z',
  ...properties,
});

describe('getNavigationMenuItemsKeptAfterRemoval', () => {
  it('should keep a hidden section with everything it holds', () => {
    const section = buildNavigationMenuItem({
      id: 'section',
      type: NavigationMenuItemType.SECTION,
    });
    const folder = buildNavigationMenuItem({
      id: 'folder',
      type: NavigationMenuItemType.FOLDER,
      parentId: 'section',
    });
    const object = buildNavigationMenuItem({
      id: 'object',
      parentId: 'folder',
    });
    const hiddenSection = { ...section, isActive: false };

    expect(
      getNavigationMenuItemsKeptAfterRemoval({
        navigationMenuItemsBeforeRemoval: [section, folder, object],
        removedNavigationMenuItems: [hiddenSection, folder, object],
      }),
    ).toEqual([hiddenSection, folder, object]);
  });

  it('should keep nothing when every removed item was deleted', () => {
    const folder = buildNavigationMenuItem({
      id: 'folder',
      type: NavigationMenuItemType.FOLDER,
    });
    const object = buildNavigationMenuItem({
      id: 'object',
      parentId: 'folder',
    });

    expect(
      getNavigationMenuItemsKeptAfterRemoval({
        navigationMenuItemsBeforeRemoval: [folder, object],
        removedNavigationMenuItems: [folder, object],
      }),
    ).toEqual([]);
  });

  it('should keep an item hidden out of a deleted folder with what it holds', () => {
    const folder = buildNavigationMenuItem({
      id: 'folder',
      type: NavigationMenuItemType.FOLDER,
      parentId: 'tab',
    });
    const standardFolder = buildNavigationMenuItem({
      id: 'standard-folder',
      type: NavigationMenuItemType.FOLDER,
      parentId: 'folder',
    });
    const object = buildNavigationMenuItem({
      id: 'object',
      parentId: 'standard-folder',
    });
    const liftedStandardFolder = {
      ...standardFolder,
      parentId: 'tab',
      isActive: false,
    };

    expect(
      getNavigationMenuItemsKeptAfterRemoval({
        navigationMenuItemsBeforeRemoval: [folder, standardFolder, object],
        removedNavigationMenuItems: [folder, liftedStandardFolder, object],
      }),
    ).toEqual([liftedStandardFolder, object]);
  });
});
