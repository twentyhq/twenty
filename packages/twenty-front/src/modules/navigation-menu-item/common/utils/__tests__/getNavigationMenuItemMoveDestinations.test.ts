import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuItemMoveDestinations } from '@/navigation-menu-item/common/utils/getNavigationMenuItemMoveDestinations';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const buildItem = (
  item: Pick<NavigationMenuItem, 'id' | 'type'> & Partial<NavigationMenuItem>,
): NavigationMenuItem => ({
  __typename: 'NavigationMenuItem',
  name: item.id,
  position: 0,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...item,
});

describe('getNavigationMenuItemMoveDestinations', () => {
  it('should list the top level, folders and sections of Home and every tab', () => {
    const items = [
      buildItem({ id: 'home-folder', type: NavigationMenuItemType.FOLDER }),
      buildItem({
        id: 'home-section',
        type: NavigationMenuItemType.SECTION,
        position: 1,
      }),
      buildItem({ id: 'sales', type: NavigationMenuItemType.TAB }),
      buildItem({
        id: 'pipeline',
        type: NavigationMenuItemType.SECTION,
        parentId: 'sales',
        position: 2,
      }),
      buildItem({
        id: 'deals',
        type: NavigationMenuItemType.SECTION,
        parentId: 'sales',
        position: 1,
      }),
      buildItem({
        id: 'deals-folder',
        type: NavigationMenuItemType.FOLDER,
        parentId: 'deals',
      }),
      buildItem({
        id: 'channels',
        type: NavigationMenuItemType.SECTION,
        parentId: 'sales',
        builtInSectionKey: 'aiChatChannels',
      }),
      buildItem({
        id: 'companies',
        type: NavigationMenuItemType.OBJECT,
        parentId: 'sales',
      }),
    ];

    expect(
      getNavigationMenuItemMoveDestinations({
        items,
        tabIds: ['sales'],
      }).map((destination) => [
        destination.kind,
        destination.containerId,
        destination.tabId,
      ]),
    ).toEqual([
      ['root', null, null],
      ['folder', 'home-folder', null],
      ['section', 'home-section', null],
      ['root', 'sales', 'sales'],
      ['section', 'deals', 'sales'],
      ['folder', 'deals-folder', 'sales'],
      ['section', 'pipeline', 'sales'],
    ]);
  });
});
