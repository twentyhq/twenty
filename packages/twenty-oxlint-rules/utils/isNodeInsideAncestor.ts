export const isNodeInsideAncestor = (node: any, ancestor: any): boolean => {
  let nextParent: any = node.parent;

  while (nextParent) {
    if (nextParent === ancestor) {
      return true;
    }

    nextParent = nextParent.parent;
  }

  return false;
};
