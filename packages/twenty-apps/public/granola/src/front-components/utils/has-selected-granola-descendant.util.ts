import { type GranolaFolderTreeNode } from 'src/front-components/utils/compute-granola-folder-tree.util';

export const hasSelectedGranolaDescendant = (
  node: GranolaFolderTreeNode,
  selectedFolderIds: Set<string>,
): boolean =>
  node.children.some(
    (child) =>
      selectedFolderIds.has(child.folder.id) ||
      hasSelectedGranolaDescendant(child, selectedFolderIds),
  );
