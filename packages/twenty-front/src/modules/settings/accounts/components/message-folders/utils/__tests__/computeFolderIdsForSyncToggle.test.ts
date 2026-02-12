import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { computeFolderIdsForSyncToggle } from '@/settings/accounts/components/message-folders/utils/computeFolderIdsForSyncToggle';

describe('computeFolderIdsForSyncToggle', () => {
  const createFolder = ({
    id,
    name,
    parentFolderId = null,
    externalId = null,
    isSynced = false,
  }: {
    id: string;
    name: string;
    parentFolderId?: string | null;
    externalId?: string | null;
    isSynced?: boolean;
  }): MessageFolder => ({
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
      const inbox = createFolder({ id: 'inbox', name: 'Inbox' });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'inbox',
        allFolders: [inbox],
        isSynced: true,
      });

      expect(result).toEqual(['inbox']);
    });

    it('should include ancestors when syncing a nested folder', () => {
      const work = createFolder({
        id: 'work',
        name: 'Work',
        externalId: 'ext-work',
      });
      const nested = createFolder({
        id: 'nested',
        name: 'Nested',
        parentFolderId: 'ext-work',
        externalId: 'ext-nested',
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'nested',
        allFolders: [work, nested],
        isSynced: true,
      });

      expect(result).toContain('nested');
      expect(result).toContain('work');
      expect(result).toHaveLength(2);
    });

    it('should NOT include siblings when syncing a child folder', () => {
      const parent = createFolder({
        id: 'parent',
        name: 'Parent',
        externalId: 'ext-parent',
        isSynced: false,
      });
      const childA = createFolder({
        id: 'child-a',
        name: 'Child A',
        parentFolderId: 'ext-parent',
        externalId: 'ext-child-a',
        isSynced: false,
      });
      const childB = createFolder({
        id: 'child-b',
        name: 'Child B',
        parentFolderId: 'ext-parent',
        externalId: 'ext-child-b',
        isSynced: false,
      });
      const childC = createFolder({
        id: 'child-c',
        name: 'Child C',
        parentFolderId: 'ext-parent',
        externalId: 'ext-child-c',
        isSynced: false,
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'child-a',
        allFolders: [parent, childA, childB, childC],
        isSynced: true,
      });

      expect(result).toContain('child-a');
      expect(result).toContain('parent');
      expect(result).not.toContain('child-b');
      expect(result).not.toContain('child-c');
      expect(result).toHaveLength(2);
    });

    it('should include all ancestors up to root', () => {
      const work = createFolder({
        id: 'work',
        name: 'Work',
        externalId: 'ext-work',
      });
      const nested = createFolder({
        id: 'nested',
        name: 'Nested',
        parentFolderId: 'ext-work',
        externalId: 'ext-nested',
      });
      const deep = createFolder({
        id: 'deep',
        name: 'Deep',
        parentFolderId: 'ext-nested',
        externalId: 'ext-deep',
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'deep',
        allFolders: [work, nested, deep],
        isSynced: true,
      });

      expect(result).toContain('deep');
      expect(result).toContain('nested');
      expect(result).toContain('work');
      expect(result).toHaveLength(3);
    });

    it('should include descendants when syncing a parent folder', () => {
      const work = createFolder({
        id: 'work',
        name: 'Work',
        externalId: 'ext-work',
      });
      const child1 = createFolder({
        id: 'child1',
        name: 'Child 1',
        parentFolderId: 'ext-work',
        externalId: 'ext-c1',
      });
      const child2 = createFolder({
        id: 'child2',
        name: 'Child 2',
        parentFolderId: 'ext-work',
        externalId: 'ext-c2',
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'work',
        allFolders: [work, child1, child2],
        isSynced: true,
      });

      expect(result).toContain('work');
      expect(result).toContain('child1');
      expect(result).toContain('child2');
      expect(result).toHaveLength(3);
    });

    it('should include both ancestors and descendants', () => {
      const root = createFolder({
        id: 'root',
        name: 'Root',
        externalId: 'ext-root',
      });
      const middle = createFolder({
        id: 'middle',
        name: 'Middle',
        parentFolderId: 'ext-root',
        externalId: 'ext-middle',
      });
      const leaf = createFolder({
        id: 'leaf',
        name: 'Leaf',
        parentFolderId: 'ext-middle',
        externalId: 'ext-leaf',
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'middle',
        allFolders: [root, middle, leaf],
        isSynced: true,
      });

      expect(result).toContain('root');
      expect(result).toContain('middle');
      expect(result).toContain('leaf');
      expect(result).toHaveLength(3);
    });
  });

  describe('when unsyncing a folder', () => {
    it('should include only the folder for a root folder', () => {
      const inbox = createFolder({
        id: 'inbox',
        name: 'Inbox',
        externalId: 'ext-inbox',
        isSynced: true,
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'inbox',
        allFolders: [inbox],
        isSynced: false,
      });

      expect(result).toEqual(['inbox']);
    });

    it('should include descendants when unsyncing a parent', () => {
      const work = createFolder({
        id: 'work',
        name: 'Work',
        externalId: 'ext-work',
        isSynced: true,
      });
      const child1 = createFolder({
        id: 'child1',
        name: 'Child 1',
        parentFolderId: 'ext-work',
        externalId: 'ext-c1',
        isSynced: true,
      });
      const child2 = createFolder({
        id: 'child2',
        name: 'Child 2',
        parentFolderId: 'ext-work',
        externalId: 'ext-c2',
        isSynced: true,
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'work',
        allFolders: [work, child1, child2],
        isSynced: false,
      });

      expect(result).toContain('work');
      expect(result).toContain('child1');
      expect(result).toContain('child2');
      expect(result).toHaveLength(3);
    });

    it('should NOT unsync parent when it has other synced children', () => {
      const work = createFolder({
        id: 'work',
        name: 'Work',
        externalId: 'ext-work',
        isSynced: true,
      });
      const child1 = createFolder({
        id: 'child1',
        name: 'Child 1',
        parentFolderId: 'ext-work',
        externalId: 'ext-c1',
        isSynced: true,
      });
      const child2 = createFolder({
        id: 'child2',
        name: 'Child 2',
        parentFolderId: 'ext-work',
        externalId: 'ext-c2',
        isSynced: true,
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'child1',
        allFolders: [work, child1, child2],
        isSynced: false,
      });

      expect(result).toContain('child1');
      expect(result).not.toContain('work');
      expect(result).not.toContain('child2');
      expect(result).toHaveLength(1);
    });

    it('should unsync parent when all children are being unsynced', () => {
      const work = createFolder({
        id: 'work',
        name: 'Work',
        externalId: 'ext-work',
        isSynced: true,
      });
      const nested = createFolder({
        id: 'nested',
        name: 'Nested',
        parentFolderId: 'ext-work',
        externalId: 'ext-nested',
        isSynced: true,
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'nested',
        allFolders: [work, nested],
        isSynced: false,
      });

      expect(result).toContain('nested');
      expect(result).toContain('work');
      expect(result).toHaveLength(2);
    });

    it('should cascade unsync up to root when no other synced siblings exist', () => {
      const root = createFolder({
        id: 'root',
        name: 'Root',
        externalId: 'ext-root',
        isSynced: true,
      });
      const middle = createFolder({
        id: 'middle',
        name: 'Middle',
        parentFolderId: 'ext-root',
        externalId: 'ext-middle',
        isSynced: true,
      });
      const leaf = createFolder({
        id: 'leaf',
        name: 'Leaf',
        parentFolderId: 'ext-middle',
        externalId: 'ext-leaf',
        isSynced: true,
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'leaf',
        allFolders: [root, middle, leaf],
        isSynced: false,
      });

      expect(result).toContain('leaf');
      expect(result).toContain('middle');
      expect(result).toContain('root');
      expect(result).toHaveLength(3);
    });

    it('should stop cascading when an ancestor has other synced children', () => {
      const root = createFolder({
        id: 'root',
        name: 'Root',
        externalId: 'ext-root',
        isSynced: true,
      });
      const branch1 = createFolder({
        id: 'branch1',
        name: 'Branch 1',
        parentFolderId: 'ext-root',
        externalId: 'ext-b1',
        isSynced: true,
      });
      const branch2 = createFolder({
        id: 'branch2',
        name: 'Branch 2',
        parentFolderId: 'ext-root',
        externalId: 'ext-b2',
        isSynced: true,
      });
      const leaf = createFolder({
        id: 'leaf',
        name: 'Leaf',
        parentFolderId: 'ext-b1',
        externalId: 'ext-leaf',
        isSynced: true,
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'leaf',
        allFolders: [root, branch1, branch2, leaf],
        isSynced: false,
      });

      expect(result).toContain('leaf');
      expect(result).toContain('branch1');
      expect(result).not.toContain('root');
      expect(result).not.toContain('branch2');
      expect(result).toHaveLength(2);
    });

    it('should handle unsyncing when sibling is already unsynced', () => {
      const work = createFolder({
        id: 'work',
        name: 'Work',
        externalId: 'ext-work',
        isSynced: true,
      });
      const child1 = createFolder({
        id: 'child1',
        name: 'Child 1',
        parentFolderId: 'ext-work',
        externalId: 'ext-c1',
        isSynced: true,
      });
      const child2 = createFolder({
        id: 'child2',
        name: 'Child 2',
        parentFolderId: 'ext-work',
        externalId: 'ext-c2',
        isSynced: false,
      });
      const result = computeFolderIdsForSyncToggle({
        folderId: 'child1',
        allFolders: [work, child1, child2],
        isSynced: false,
      });

      expect(result).toContain('child1');
      expect(result).toContain('work');
      expect(result).toHaveLength(2);
    });
  });
});
