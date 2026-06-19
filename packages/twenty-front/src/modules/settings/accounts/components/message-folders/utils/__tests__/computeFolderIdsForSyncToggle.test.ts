import { computeFolderIdsForSyncToggle } from '@/settings/accounts/components/message-folders/utils/computeFolderIdsForSyncToggle';

describe('computeFolderIdsForSyncToggle', () => {
  it('should return only the toggled folder id for a root folder', () => {
    const result = computeFolderIdsForSyncToggle({ folderId: 'inbox' });

    expect(result).toEqual(['inbox']);
  });

  it('should return only the toggled folder id for a leaf folder', () => {
    const result = computeFolderIdsForSyncToggle({ folderId: 'child-a' });

    expect(result).toEqual(['child-a']);
  });

  it('should return only the toggled folder id for a mid-tree folder', () => {
    const result = computeFolderIdsForSyncToggle({ folderId: 'middle' });

    expect(result).toEqual(['middle']);
  });

  it('should not include siblings', () => {
    const result = computeFolderIdsForSyncToggle({ folderId: 'child-a' });

    expect(result).not.toContain('child-b');
    expect(result).not.toContain('child-c');
    expect(result).toHaveLength(1);
  });

  it('should not include parent folders', () => {
    const result = computeFolderIdsForSyncToggle({ folderId: 'child-a' });

    expect(result).not.toContain('parent');
    expect(result).toHaveLength(1);
  });

  it('should not include child folders', () => {
    const result = computeFolderIdsForSyncToggle({ folderId: 'parent' });

    expect(result).not.toContain('child-a');
    expect(result).not.toContain('child-b');
    expect(result).toHaveLength(1);
  });
});
