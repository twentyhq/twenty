import { NavigationMenuItemType } from 'twenty-shared/types';

import { NAVIGATION_MENU_ITEM_APPEND_INDEX } from '@/navigation-menu-item/common/constants/NavigationMenuItemAppendIndex';
import { computeNavigationMenuItemDropPlacement } from '@/navigation-menu-item/common/utils/computeNavigationMenuItemDropPlacement';

const SORTED_ITEMS = [
  {
    id: 'pipeline',
    type: NavigationMenuItemType.SECTION,
    parentId: 'tab',
    position: 0,
  },
  {
    id: 'accounts',
    type: NavigationMenuItemType.SECTION,
    parentId: 'tab',
    position: 1,
  },
  {
    id: 'pipeline-folder',
    type: NavigationMenuItemType.FOLDER,
    parentId: 'pipeline',
    position: 0,
  },
  {
    id: 'pipeline-link',
    type: NavigationMenuItemType.LINK,
    parentId: 'pipeline',
    position: 1,
  },
  {
    id: 'folder-child',
    type: NavigationMenuItemType.LINK,
    parentId: 'pipeline-folder',
    position: 0,
  },
  {
    id: 'accounts-first',
    type: NavigationMenuItemType.LINK,
    parentId: 'accounts',
    position: 0,
  },
  {
    id: 'accounts-second',
    type: NavigationMenuItemType.LINK,
    parentId: 'accounts',
    position: 1,
  },
].sort((a, b) => a.position - b.position);

const PIPELINE_FOLDER = {
  id: 'pipeline-folder',
  type: NavigationMenuItemType.FOLDER,
};
const PIPELINE_LINK = {
  id: 'pipeline-link',
  type: NavigationMenuItemType.LINK,
};

describe('computeNavigationMenuItemDropPlacement', () => {
  it('should move a folder into another section before its first item', () => {
    const placement = computeNavigationMenuItemDropPlacement({
      draggedItem: PIPELINE_FOLDER,
      sourceParentId: 'pipeline',
      destinationTarget: { kind: 'tabOrSectionList', parentId: 'accounts' },
      destinationIndex: 0,
      sortedItems: SORTED_ITEMS,
    });

    expect(placement?.parentId).toBe('accounts');
    expect(placement?.position).toBeLessThan(0);
    expect(placement?.folderIdToOpen).toBeUndefined();
  });

  it('should place an item before the item it was dropped on', () => {
    const placement = computeNavigationMenuItemDropPlacement({
      draggedItem: PIPELINE_LINK,
      sourceParentId: 'pipeline',
      destinationTarget: { kind: 'tabOrSectionList', parentId: 'accounts' },
      destinationIndex: 0,
      insertBeforeItemId: 'accounts-second',
      sortedItems: SORTED_ITEMS,
    });

    expect(placement?.parentId).toBe('accounts');
    expect(placement?.position).toBeGreaterThan(0);
    expect(placement?.position).toBeLessThan(1);
  });

  it('should append an item dropped on a folder header and open the folder', () => {
    expect(
      computeNavigationMenuItemDropPlacement({
        draggedItem: {
          id: 'accounts-first',
          type: NavigationMenuItemType.LINK,
        },
        sourceParentId: 'accounts',
        destinationTarget: {
          kind: 'folderHeader',
          parentId: 'pipeline-folder',
        },
        destinationIndex: 0,
        sortedItems: SORTED_ITEMS,
      }),
    ).toEqual({
      position: expect.any(Number),
      parentId: 'pipeline-folder',
      folderIdToOpen: 'pipeline-folder',
    });
  });

  it('should append when the index is past the end of the list', () => {
    const placement = computeNavigationMenuItemDropPlacement({
      draggedItem: PIPELINE_LINK,
      sourceParentId: 'pipeline',
      destinationTarget: { kind: 'tabOrSectionList', parentId: 'accounts' },
      destinationIndex: NAVIGATION_MENU_ITEM_APPEND_INDEX,
      sortedItems: SORTED_ITEMS,
    });

    expect(placement?.parentId).toBe('accounts');
    expect(placement?.position).toBeGreaterThan(1);
  });

  it('should reorder within the same list without changing the parent', () => {
    const placement = computeNavigationMenuItemDropPlacement({
      draggedItem: PIPELINE_LINK,
      sourceParentId: 'pipeline',
      destinationTarget: { kind: 'tabOrSectionList', parentId: 'pipeline' },
      destinationIndex: 0,
      sortedItems: SORTED_ITEMS,
    });

    expect(placement).not.toBeNull();
    expect(placement?.parentId).toBeUndefined();
    expect(placement?.position).toBeLessThan(0);
  });

  it('should refuse a folder dropped into a folder', () => {
    expect(
      computeNavigationMenuItemDropPlacement({
        draggedItem: PIPELINE_FOLDER,
        sourceParentId: 'pipeline',
        destinationTarget: {
          kind: 'folderHeader',
          parentId: 'pipeline-folder',
        },
        destinationIndex: 0,
        sortedItems: SORTED_ITEMS,
      }),
    ).toBeNull();
    expect(
      computeNavigationMenuItemDropPlacement({
        draggedItem: PIPELINE_FOLDER,
        sourceParentId: 'pipeline',
        destinationTarget: { kind: 'folder', parentId: 'pipeline-folder' },
        destinationIndex: 0,
        sortedItems: SORTED_ITEMS,
      }),
    ).toBeNull();
  });
});
