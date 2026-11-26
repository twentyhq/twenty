import { NavigationMenuItemType } from 'twenty-shared/types';

import { getNavigationMenuItemMoveDestinationGroups } from '@/navigation-menu-item/common/utils/getNavigationMenuItemMoveDestinationGroups';
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
  buildItem({ id: 'support', type: NavigationMenuItemType.TAB, position: 1 }),
  buildItem({
    id: 'support-folder',
    type: NavigationMenuItemType.FOLDER,
    parentId: 'support',
  }),
];

const toContainerIdsByTab = (
  groups: ReturnType<typeof getNavigationMenuItemMoveDestinationGroups>,
) =>
  groups.map((group) => [
    group.tabId,
    group.destinations.map((destination) => destination.containerId),
  ]);

describe('getNavigationMenuItemMoveDestinationGroups', () => {
  it('should group the root level, folders and sections under Home then each tab', () => {
    expect(
      toContainerIdsByTab(
        getNavigationMenuItemMoveDestinationGroups({
          items,
          tabIds: ['sales', 'support'],
          canMoveIntoFolder: true,
        }),
      ),
    ).toEqual([
      [null, [null, 'home-folder', 'home-section']],
      ['sales', ['sales', 'deals', 'deals-folder', 'pipeline']],
      ['support', ['support', 'support-folder']],
    ]);
  });

  it('should follow the given tab order', () => {
    expect(
      getNavigationMenuItemMoveDestinationGroups({
        items,
        tabIds: ['support', 'sales'],
        canMoveIntoFolder: true,
      }).map((group) => group.tabId),
    ).toEqual([null, 'support', 'sales']);
  });

  it('should keep only the root level and sections when the item cannot move into a folder', () => {
    expect(
      toContainerIdsByTab(
        getNavigationMenuItemMoveDestinationGroups({
          items,
          tabIds: ['sales', 'support'],
          canMoveIntoFolder: false,
        }),
      ),
    ).toEqual([
      [null, [null, 'home-section']],
      ['sales', ['sales', 'deals', 'pipeline']],
      ['support', ['support']],
    ]);
  });
});
