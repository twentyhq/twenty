import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuItemIdsToDeleteOnSave } from '@/navigation-menu-item/edit/utils/getNavigationMenuItemIdsToDeleteOnSave';
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

const HIDDEN_FOLDER = buildNavigationMenuItem({
  id: 'hidden-folder',
  isActive: false,
});
const LINK_IN_HIDDEN_FOLDER = buildNavigationMenuItem({
  id: 'link-in-hidden-folder',
  type: NavigationMenuItemType.LINK,
  parentId: HIDDEN_FOLDER.id,
});
const VISIBLE_LINK = buildNavigationMenuItem({
  id: 'visible-link',
  type: NavigationMenuItemType.LINK,
});

describe('getNavigationMenuItemIdsToDeleteOnSave', () => {
  it('should not delete hidden items or what they hold', () => {
    expect(
      getNavigationMenuItemIdsToDeleteOnSave({
        workspaceItems: [HIDDEN_FOLDER, LINK_IN_HIDDEN_FOLDER, VISIBLE_LINK],
        draft: [],
      }),
    ).toEqual(['visible-link']);
  });

  it('should delete an item removed from a folder restored in the draft', () => {
    expect(
      getNavigationMenuItemIdsToDeleteOnSave({
        workspaceItems: [HIDDEN_FOLDER, LINK_IN_HIDDEN_FOLDER, VISIBLE_LINK],
        draft: [{ ...HIDDEN_FOLDER, isActive: true }, VISIBLE_LINK],
      }),
    ).toEqual(['link-in-hidden-folder']);
  });
});
