import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { computeFolderIdsForSyncToggle } from '@/settings/accounts/components/message-folders/utils/computeFolderIdsForSyncToggle';

describe('computeFolderIdsForSyncToggle', () => {
  const createFolder = (
    id: string,
    name: string,
    parentFolderId: string | null = null,
    externalId: string | null = null,
    isSynced = false,
  ): MessageFolder => ({
    id,
    name,
    parentFolderId,
    externalId: externalId || id,
    isSentFolder: false,
    isSynced,
    messageChannelId: 'channel-1',
    __typename: 'MessageFolder',
    syncCursor: '',
  });

  describe('when syncing a folder', () => {
    it('should include the folder itself for a root folder', () => {
      const inbox = createFolder('inbox', 'Inbox');
      const result = computeFolderIdsForSyncToggle('inbox', [inbox], true);

      expect(result).toEqual(['inbox']);
    });

    it('should include ancestors when syncing a nested folder', () => {
      const work = createFolder('work', 'Work', null, 'ext-work');
      const nested = createFolder('nested', 'Nested', 'ext-work', 'ext-nested');
      const result = computeFolderIdsForSyncToggle(
        'nested',
        [work, nested],
        true,
      );

      expect(result).toContain('nested');
      expect(result).toContain('work');
      expect(result).toHaveLength(2);
    });

    it('should include all ancestors up to root', () => {
      const work = createFolder('work', 'Work', null, 'ext-work');
      const nested = createFolder('nested', 'Nested', 'ext-work', 'ext-nested');
      const deep = createFolder('deep', 'Deep', 'ext-nested', 'ext-deep');
      const result = computeFolderIdsForSyncToggle(
        'deep',
        [work, nested, deep],
        true,
      );

      expect(result).toContain('deep');
      expect(result).toContain('nested');
      expect(result).toContain('work');
      expect(result).toHaveLength(3);
    });

    it('should include descendants when syncing a parent folder', () => {
      const work = createFolder('work', 'Work', null, 'ext-work');
      const child1 = createFolder('child1', 'Child 1', 'ext-work', 'ext-c1');
      const child2 = createFolder('child2', 'Child 2', 'ext-work', 'ext-c2');
      const result = computeFolderIdsForSyncToggle(
        'work',
        [work, child1, child2],
        true,
      );

      expect(result).toContain('work');
      expect(result).toContain('child1');
      expect(result).toContain('child2');
      expect(result).toHaveLength(3);
    });

    it('should include both ancestors and descendants', () => {
      const root = createFolder('root', 'Root', null, 'ext-root');
      const middle = createFolder('middle', 'Middle', 'ext-root', 'ext-middle');
      const leaf = createFolder('leaf', 'Leaf', 'ext-middle', 'ext-leaf');
      const result = computeFolderIdsForSyncToggle(
        'middle',
        [root, middle, leaf],
        true,
      );

      expect(result).toContain('root');
      expect(result).toContain('middle');
      expect(result).toContain('leaf');
      expect(result).toHaveLength(3);
    });
  });

  describe('when unsyncing a folder', () => {
    it('should include only the folder for a root folder', () => {
      const inbox = createFolder('inbox', 'Inbox', null, 'ext-inbox', true);
      const result = computeFolderIdsForSyncToggle('inbox', [inbox], false);

      expect(result).toEqual(['inbox']);
    });

    it('should include descendants when unsyncing a parent', () => {
      const work = createFolder('work', 'Work', null, 'ext-work', true);
      const child1 = createFolder(
        'child1',
        'Child 1',
        'ext-work',
        'ext-c1',
        true,
      );
      const child2 = createFolder(
        'child2',
        'Child 2',
        'ext-work',
        'ext-c2',
        true,
      );
      const result = computeFolderIdsForSyncToggle(
        'work',
        [work, child1, child2],
        false,
      );

      expect(result).toContain('work');
      expect(result).toContain('child1');
      expect(result).toContain('child2');
      expect(result).toHaveLength(3);
    });

    it('should NOT unsync parent when it has other synced children', () => {
      const work = createFolder('work', 'Work', null, 'ext-work', true);
      const child1 = createFolder(
        'child1',
        'Child 1',
        'ext-work',
        'ext-c1',
        true,
      );
      const child2 = createFolder(
        'child2',
        'Child 2',
        'ext-work',
        'ext-c2',
        true,
      );
      const result = computeFolderIdsForSyncToggle(
        'child1',
        [work, child1, child2],
        false,
      );

      expect(result).toContain('child1');
      expect(result).not.toContain('work');
      expect(result).not.toContain('child2');
      expect(result).toHaveLength(1);
    });

    it('should unsync parent when all children are being unsynced', () => {
      const work = createFolder('work', 'Work', null, 'ext-work', true);
      const nested = createFolder(
        'nested',
        'Nested',
        'ext-work',
        'ext-nested',
        true,
      );
      const result = computeFolderIdsForSyncToggle(
        'nested',
        [work, nested],
        false,
      );

      expect(result).toContain('nested');
      expect(result).toContain('work');
      expect(result).toHaveLength(2);
    });

    it('should cascade unsync up to root when no other synced siblings exist', () => {
      const root = createFolder('root', 'Root', null, 'ext-root', true);
      const middle = createFolder(
        'middle',
        'Middle',
        'ext-root',
        'ext-middle',
        true,
      );
      const leaf = createFolder('leaf', 'Leaf', 'ext-middle', 'ext-leaf', true);
      const result = computeFolderIdsForSyncToggle(
        'leaf',
        [root, middle, leaf],
        false,
      );

      expect(result).toContain('leaf');
      expect(result).toContain('middle');
      expect(result).toContain('root');
      expect(result).toHaveLength(3);
    });

    it('should stop cascading when an ancestor has other synced children', () => {
      const root = createFolder('root', 'Root', null, 'ext-root', true);
      const branch1 = createFolder(
        'branch1',
        'Branch 1',
        'ext-root',
        'ext-b1',
        true,
      );
      const branch2 = createFolder(
        'branch2',
        'Branch 2',
        'ext-root',
        'ext-b2',
        true,
      );
      const leaf = createFolder('leaf', 'Leaf', 'ext-b1', 'ext-leaf', true);
      const result = computeFolderIdsForSyncToggle(
        'leaf',
        [root, branch1, branch2, leaf],
        false,
      );

      expect(result).toContain('leaf');
      expect(result).toContain('branch1');
      expect(result).not.toContain('root');
      expect(result).not.toContain('branch2');
      expect(result).toHaveLength(2);
    });

    it('should handle unsyncing when sibling is already unsynced', () => {
      const work = createFolder('work', 'Work', null, 'ext-work', true);
      const child1 = createFolder(
        'child1',
        'Child 1',
        'ext-work',
        'ext-c1',
        true,
      );
      const child2 = createFolder(
        'child2',
        'Child 2',
        'ext-work',
        'ext-c2',
        false,
      );
      const result = computeFolderIdsForSyncToggle(
        'child1',
        [work, child1, child2],
        false,
      );

      expect(result).toContain('child1');
      expect(result).toContain('work');
      expect(result).toHaveLength(2);
    });
  });
});
