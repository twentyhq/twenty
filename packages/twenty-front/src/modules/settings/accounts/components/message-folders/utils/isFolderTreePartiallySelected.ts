import { type MessageFolderTreeNode } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';

export const isFolderTreePartiallySelected = (
  node: MessageFolderTreeNode,
): boolean => {
  const nodes: MessageFolderTreeNode[] = [node];
  let hasSynced = false;
  let hasUnsynced = false;

  while (nodes.length > 0) {
    const current = nodes.pop()!;

    if (current.folder.isSynced) {
      hasSynced = true;
    } else {
      hasUnsynced = true;
    }

    if (hasSynced && hasUnsynced) {
      return true;
    }

    nodes.push(...current.children);
  }

  return false;
};
