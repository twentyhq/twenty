import { type MessageFolderTreeNode } from '@/settings/accounts/components/message-folders/utils/computeMessageFolderTree';

export const countNestedFolders = (node: MessageFolderTreeNode): number => {
  let count = node.children.length;

  for (const child of node.children) {
    count += countNestedFolders(child);
  }

  return count;
};
