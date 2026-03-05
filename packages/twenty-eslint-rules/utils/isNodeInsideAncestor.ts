import { type TSESTree } from '@typescript-eslint/utils';

export const isNodeInsideAncestor = (
  node: TSESTree.Node,
  ancestor: TSESTree.Node,
): boolean => {
  let nextParent: TSESTree.Node | undefined = node.parent;

  while (nextParent) {
    if (nextParent === ancestor) {
      return true;
    }

    nextParent = nextParent.parent;
  }

  return false;
};
