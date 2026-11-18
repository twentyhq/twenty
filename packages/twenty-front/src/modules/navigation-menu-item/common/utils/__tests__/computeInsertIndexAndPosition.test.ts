import { computeInsertIndexAndPosition } from '@/navigation-menu-item/common/utils/computeInsertIndexAndPosition';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

const getSiblings = (items: NavigationMenuItem[], parentId: string | null) =>
  items
    .filter((item) => (item.parentId ?? null) === parentId)
    .sort((a, b) => a.position - b.position);

const compute = (
  items: NavigationMenuItem[],
  parentId: string | null,
  targetIndex: number,
) =>
  computeInsertIndexAndPosition({
    items,
    siblings: getSiblings(items, parentId),
    targetIndex,
  });

describe('computeInsertIndexAndPosition', () => {
  it('should compute flatIndex and position for insert in folder', () => {
    const empty: NavigationMenuItem[] = [];
    expect(compute(empty, null, 0)).toEqual({
      flatIndex: 0,
      position: 0.5,
    });

    const draft: NavigationMenuItem[] = [
      { id: '1', parentId: null, position: 10 } as NavigationMenuItem,
      { id: '2', parentId: null, position: 20 } as NavigationMenuItem,
    ];
    const between = compute(draft, null, 1);
    expect(between.flatIndex).toBe(1);
    expect(between.position).toBe(15);
  });

  it('should only consider items in the target folder', () => {
    const draft: NavigationMenuItem[] = [
      { id: '1', parentId: 'folder-a', position: 10 } as NavigationMenuItem,
      { id: '2', parentId: 'folder-b', position: 20 } as NavigationMenuItem,
      { id: '3', parentId: 'folder-b', position: 30 } as NavigationMenuItem,
    ];
    const result = compute(draft, 'folder-b', 1);
    expect(result.flatIndex).toBe(2);
    expect(result.position).toBe(25);
  });

  it('should consider personal items, as callers pass a section-scoped list', () => {
    const personalItems: NavigationMenuItem[] = [
      {
        id: '1',
        parentId: null,
        position: 10,
        userWorkspaceId: 'ws-1',
      } as NavigationMenuItem,
      {
        id: '2',
        parentId: null,
        position: 20,
        userWorkspaceId: 'ws-1',
      } as NavigationMenuItem,
    ];
    const inserted = compute(personalItems, null, 1);
    expect(inserted.flatIndex).toBe(1);
    expect(inserted.position).toBe(15);
  });
});
