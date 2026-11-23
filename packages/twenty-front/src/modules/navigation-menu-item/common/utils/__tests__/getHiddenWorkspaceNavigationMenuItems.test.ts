import { NavigationMenuItemType } from 'twenty-shared/types';

import { getHiddenWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/getHiddenWorkspaceNavigationMenuItems';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const buildNavigationMenuItem = (
  properties: Pick<NavigationMenuItem, 'id'> &
    Partial<
      Pick<
        NavigationMenuItem,
        'type' | 'parentId' | 'isActive' | 'userWorkspaceId'
      >
    >,
): NavigationMenuItem => ({
  type: NavigationMenuItemType.OBJECT,
  position: 0,
  isActive: true,
  createdAt: '2026-11-19T00:00:00.000Z',
  updatedAt: '2026-11-19T00:00:00.000Z',
  ...properties,
});

describe('getHiddenWorkspaceNavigationMenuItems', () => {
  it('should return hidden workspace items of the tab and what they hold, minus excluded ones', () => {
    const navigationMenuItems = [
      buildNavigationMenuItem({ id: 'hidden-folder', isActive: false }),
      buildNavigationMenuItem({ id: 'child', parentId: 'hidden-folder' }),
      buildNavigationMenuItem({ id: 'visible' }),
      buildNavigationMenuItem({ id: 'restored-in-draft', isActive: false }),
      buildNavigationMenuItem({
        id: 'personal-favorite',
        isActive: false,
        userWorkspaceId: 'member',
      }),
      buildNavigationMenuItem({ id: 'tab', type: NavigationMenuItemType.TAB }),
      buildNavigationMenuItem({
        id: 'hidden-in-other-tab',
        parentId: 'tab',
        isActive: false,
      }),
    ];

    expect(
      getHiddenWorkspaceNavigationMenuItems({
        navigationMenuItems,
        excludedIds: new Set(['restored-in-draft']),
        tabId: null,
      }).map(({ id }) => id),
    ).toEqual(['hidden-folder', 'child']);
  });
});
