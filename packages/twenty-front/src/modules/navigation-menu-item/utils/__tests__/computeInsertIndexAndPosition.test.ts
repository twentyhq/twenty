import { computeInsertIndexAndPosition } from '@/navigation-menu-item/utils/computeInsertIndexAndPosition';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

describe('computeInsertIndexAndPosition', () => {
  it('should compute flatIndex and position for insert in folder', () => {
    const empty: NavigationMenuItem[] = [];
    expect(computeInsertIndexAndPosition(empty, null, 0)).toEqual({
      flatIndex: 0,
      position: 0.5,
    });

    const draft: NavigationMenuItem[] = [
      { id: '1', folderId: null, position: 10 } as NavigationMenuItem,
      { id: '2', folderId: null, position: 20 } as NavigationMenuItem,
    ];
    const between = computeInsertIndexAndPosition(draft, null, 1);
    expect(between.flatIndex).toBe(1);
    expect(between.position).toBe(15);
  });

  it('should only consider items in target folder and exclude userWorkspaceId', () => {
    const draft: NavigationMenuItem[] = [
      { id: '1', folderId: 'folder-a', position: 10 } as NavigationMenuItem,
      { id: '2', folderId: 'folder-b', position: 20 } as NavigationMenuItem,
      { id: '3', folderId: 'folder-b', position: 30 } as NavigationMenuItem,
    ];
    const result = computeInsertIndexAndPosition(draft, 'folder-b', 1);
    expect(result.flatIndex).toBe(2);
    expect(result.position).toBe(25);

    const withWorkspace: NavigationMenuItem[] = [
      { id: '1', folderId: null, position: 10 } as NavigationMenuItem,
      {
        id: '2',
        folderId: null,
        position: 20,
        userWorkspaceId: 'ws-1',
      } as NavigationMenuItem,
    ];
    const excluded = computeInsertIndexAndPosition(withWorkspace, null, 1);
    expect(excluded.position).toBe(10.5);
  });
});
