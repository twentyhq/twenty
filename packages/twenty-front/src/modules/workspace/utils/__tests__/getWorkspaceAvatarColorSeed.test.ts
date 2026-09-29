import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';

describe('getWorkspaceAvatarColorSeed', () => {
  it('should keep the same seed while the name is being typed', () => {
    expect(getWorkspaceAvatarColorSeed('w')).toBe('W');
    expect(getWorkspaceAvatarColorSeed('worksp')).toBe('W');
    expect(getWorkspaceAvatarColorSeed(' Workspace')).toBe('W');
  });

  it('should return an empty seed when there is no name', () => {
    expect(getWorkspaceAvatarColorSeed('')).toBe('');
    expect(getWorkspaceAvatarColorSeed(null)).toBe('');
    expect(getWorkspaceAvatarColorSeed(undefined)).toBe('');
  });
});
