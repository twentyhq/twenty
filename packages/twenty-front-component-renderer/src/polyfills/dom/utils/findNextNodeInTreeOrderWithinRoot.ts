import { isDefined } from 'twenty-shared/utils';

export const findNextNodeInTreeOrderWithinRoot = ({
  node,
  root,
}: {
  node: Node;
  root: Node;
}): Node | null => {
  if (isDefined(node.firstChild)) {
    return node.firstChild;
  }

  let ancestorOrSelf: Node | null = node;

  while (isDefined(ancestorOrSelf) && ancestorOrSelf !== root) {
    if (isDefined(ancestorOrSelf.nextSibling)) {
      return ancestorOrSelf.nextSibling;
    }

    ancestorOrSelf = ancestorOrSelf.parentNode;
  }

  return null;
};
