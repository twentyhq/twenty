import { NavigationMenuItemType } from 'twenty-shared/types';

import { getRestoredNavigationMenuItems } from '@/navigation-menu-item/edit/utils/getRestoredNavigationMenuItems';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const buildNavigationMenuItem = (
  properties: Pick<NavigationMenuItem, 'id'> &
    Partial<Pick<NavigationMenuItem, 'type' | 'parentId' | 'isActive'>>,
): NavigationMenuItem => ({
  type: NavigationMenuItemType.FOLDER,
  position: 0,
  isActive: true,
  createdAt: '2026-11-19T00:00:00.000Z',
  updatedAt: '2026-11-19T00:00:00.000Z',
  ...properties,
});

const SECTION = buildNavigationMenuItem({
  id: 'section',
  type: NavigationMenuItemType.SECTION,
});
const HIDDEN_FOLDER = buildNavigationMenuItem({
  id: 'hidden-folder',
  parentId: SECTION.id,
  isActive: false,
});
const LINK_IN_FOLDER = buildNavigationMenuItem({
  id: 'link-in-folder',
  type: NavigationMenuItemType.LINK,
  parentId: HIDDEN_FOLDER.id,
});
const HIDDEN_LINK_IN_FOLDER = buildNavigationMenuItem({
  id: 'hidden-link-in-folder',
  type: NavigationMenuItemType.LINK,
  parentId: HIDDEN_FOLDER.id,
  isActive: false,
});
const WORKSPACE_ITEMS = [
  SECTION,
  HIDDEN_FOLDER,
  LINK_IN_FOLDER,
  HIDDEN_LINK_IN_FOLDER,
];

describe('getRestoredNavigationMenuItems', () => {
  it('should restore an item with what it holds, leaving its own hidden children hidden', () => {
    expect(
      getRestoredNavigationMenuItems({
        workspaceItems: WORKSPACE_ITEMS,
        draft: [SECTION],
        navigationMenuItemId: HIDDEN_FOLDER.id,
        fallbackParentId: null,
      }),
    ).toEqual([{ ...HIDDEN_FOLDER, isActive: true }, LINK_IN_FOLDER]);
  });

  it('should put the item in the fallback container when its parent left the draft', () => {
    expect(
      getRestoredNavigationMenuItems({
        workspaceItems: WORKSPACE_ITEMS,
        draft: [],
        navigationMenuItemId: HIDDEN_FOLDER.id,
        fallbackParentId: 'sales-tab',
      })[0],
    ).toMatchObject({ id: HIDDEN_FOLDER.id, parentId: 'sales-tab' });
  });
});
