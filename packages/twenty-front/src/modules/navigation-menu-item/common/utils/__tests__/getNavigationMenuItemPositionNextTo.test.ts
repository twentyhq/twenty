import { getNavigationMenuItemPositionNextTo } from '@/navigation-menu-item/common/utils/getNavigationMenuItemPositionNextTo';

const sortedSiblings = [
  { id: 'inbox', position: -1.5 },
  { id: 'container-items', position: -0.5 },
  { id: 'workspace', position: 0 },
  { id: 'sales', position: 1 },
];

describe('getNavigationMenuItemPositionNextTo', () => {
  it.each([
    ['lands after a target below it', 'inbox', 'workspace', 0.5],
    ['lands before a target above it', 'sales', 'workspace', -0.25],
    ['lands first when dropped on the first sibling', 'sales', 'inbox', -2.5],
    ['crosses the container items', 'workspace', 'container-items', -1],
  ])('%s', (_, navigationMenuItemId, targetNavigationMenuItemId, position) => {
    expect(
      getNavigationMenuItemPositionNextTo({
        sortedSiblings,
        navigationMenuItemId,
        targetNavigationMenuItemId,
      }),
    ).toBe(position);
  });

  it.each([
    ['itself', 'workspace'],
    ['an item outside its siblings', 'developers'],
  ])('keeps its place when dropped on %s', (_, targetNavigationMenuItemId) => {
    expect(
      getNavigationMenuItemPositionNextTo({
        sortedSiblings,
        navigationMenuItemId: 'workspace',
        targetNavigationMenuItemId,
      }),
    ).toBeNull();
  });
});
