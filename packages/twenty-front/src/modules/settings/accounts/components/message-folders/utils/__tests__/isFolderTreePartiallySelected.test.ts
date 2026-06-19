import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { type MessageFolderTreeNode } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';
import { isFolderTreePartiallySelected } from '@/settings/accounts/components/message-folders/utils/isFolderTreePartiallySelected';
import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

const createFolder = (
  id: string,
  isSynced: boolean,
): MessageFolder => ({
  __typename: 'MessageFolder',
  id,
  name: id,
  isSynced,
  isSentFolder: false,
  parentFolderId: null,
  externalId: id,
  pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  messageChannelId: 'channel-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

const leaf = (id: string, isSynced: boolean): MessageFolderTreeNode => ({
  folder: createFolder(id, isSynced),
  children: [],
  hasChildren: false,
});

const node = (
  id: string,
  isSynced: boolean,
  children: MessageFolderTreeNode[],
): MessageFolderTreeNode => ({
  folder: createFolder(id, isSynced),
  children,
  hasChildren: children.length > 0,
});

describe('isFolderTreePartiallySelected', () => {
  it('should return false when single node is synced', () => {
    expect(isFolderTreePartiallySelected(leaf('a', true))).toBe(false);
  });

  it('should return false when single node is unsynced', () => {
    expect(isFolderTreePartiallySelected(leaf('a', false))).toBe(false);
  });

  it('should return false when all nodes are synced', () => {
    const tree = node('parent', true, [leaf('child-a', true), leaf('child-b', true)]);

    expect(isFolderTreePartiallySelected(tree)).toBe(false);
  });

  it('should return false when all nodes are unsynced', () => {
    const tree = node('parent', false, [leaf('child-a', false), leaf('child-b', false)]);

    expect(isFolderTreePartiallySelected(tree)).toBe(false);
  });

  it('should return true when some children are synced and some are not', () => {
    const tree = node('parent', false, [leaf('child-a', true), leaf('child-b', false)]);

    expect(isFolderTreePartiallySelected(tree)).toBe(true);
  });

  it('should return true when parent is unsynced but a child is synced', () => {
    const tree = node('parent', false, [leaf('child-a', true)]);

    expect(isFolderTreePartiallySelected(tree)).toBe(true);
  });

  it('should return true when parent is synced but a child is unsynced', () => {
    const tree = node('parent', true, [leaf('child-a', false)]);

    expect(isFolderTreePartiallySelected(tree)).toBe(true);
  });

  it('should detect mixed state in deeply nested tree', () => {
    const tree = node('root', false, [
      node('middle', false, [leaf('leaf-synced', true), leaf('leaf-unsynced', false)]),
    ]);

    expect(isFolderTreePartiallySelected(tree)).toBe(true);
  });

  it('should return false for uniformly synced deep tree', () => {
    const tree = node('root', true, [
      node('middle', true, [leaf('leaf', true)]),
    ]);

    expect(isFolderTreePartiallySelected(tree)).toBe(false);
  });
});
