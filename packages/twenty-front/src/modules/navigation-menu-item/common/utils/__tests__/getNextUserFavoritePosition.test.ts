import { getNextUserFavoritePosition } from '@/navigation-menu-item/common/utils/getNextUserFavoritePosition';

describe('getNextUserFavoritePosition', () => {
  it('returns 1 when there are no favorites', () => {
    expect(getNextUserFavoritePosition([])).toBe(1);
  });

  it('places the next favorite after the last root-level user favorite', () => {
    expect(
      getNextUserFavoritePosition([
        { parentId: null, userWorkspaceId: 'user-1', position: 2 },
        { parentId: null, userWorkspaceId: 'user-1', position: 5 },
        { parentId: 'folder-1', userWorkspaceId: 'user-1', position: 9 },
        { parentId: null, userWorkspaceId: null, position: 12 },
      ]),
    ).toBe(6);
  });
});
