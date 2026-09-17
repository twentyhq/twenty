import { type GranolaFolderTreeNode } from 'src/front-components/utils/compute-granola-folder-tree.util';

export const countNestedGranolaFolders = (
  node: GranolaFolderTreeNode,
): number =>
  node.children.reduce(
    (count, child) => count + 1 + countNestedGranolaFolders(child),
    0,
  );
