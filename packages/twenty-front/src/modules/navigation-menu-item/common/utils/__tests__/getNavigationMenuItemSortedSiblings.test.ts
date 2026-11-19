import { getNavigationMenuItemSortedSiblings } from '@/navigation-menu-item/common/utils/getNavigationMenuItemSortedSiblings';

const items = [
  { id: 'workspace-section', parentId: null, position: 0 },
  { id: 'standard-object', parentId: 'workspace-section', position: 2 },
  { id: 'app-object', parentId: null, position: 1 },
  { id: 'folder', parentId: 'workspace-section', position: 3 },
  { id: 'folder-child', parentId: 'folder', position: 0 },
];

const visibleItemIds = new Set([
  'standard-object',
  'app-object',
  'folder',
  'folder-child',
]);

const getSiblingIds = ({
  navigationMenuItemId,
  rootContainerId,
}: {
  navigationMenuItemId: string;
  rootContainerId: string | null;
}) =>
  getNavigationMenuItemSortedSiblings({
    items,
    navigationMenuItemId,
    visibleItemIds,
    rootContainerId,
  })?.map((item) => item.id);

describe('getNavigationMenuItemSortedSiblings', () => {
  it('should treat top-level items as children of the root container', () => {
    const expectedSiblingIds = ['app-object', 'standard-object', 'folder'];

    expect(
      getSiblingIds({
        navigationMenuItemId: 'app-object',
        rootContainerId: 'workspace-section',
      }),
    ).toEqual(expectedSiblingIds);
    expect(
      getSiblingIds({
        navigationMenuItemId: 'standard-object',
        rootContainerId: 'workspace-section',
      }),
    ).toEqual(expectedSiblingIds);
  });

  it('should keep top-level items apart without a root container', () => {
    expect(
      getSiblingIds({
        navigationMenuItemId: 'app-object',
        rootContainerId: null,
      }),
    ).toEqual(['app-object']);
  });

  it('should list folder children on their own', () => {
    expect(
      getSiblingIds({
        navigationMenuItemId: 'folder-child',
        rootContainerId: 'workspace-section',
      }),
    ).toEqual(['folder-child']);
  });

  it('should return null for an unknown item', () => {
    expect(
      getNavigationMenuItemSortedSiblings({
        items,
        navigationMenuItemId: 'missing',
        visibleItemIds,
        rootContainerId: 'workspace-section',
      }),
    ).toBeNull();
  });
});
