import { type TSESTree } from '@typescript-eslint/utils';

export const isInsideNode = (
  node: TSESTree.Node,
  ancestor: TSESTree.Node,
): boolean => {
  let current: TSESTree.Node | undefined = node.parent;

  while (current) {
    if (current === ancestor) {
      return true;
    }

    current = current.parent;
  }

  return false;
};
