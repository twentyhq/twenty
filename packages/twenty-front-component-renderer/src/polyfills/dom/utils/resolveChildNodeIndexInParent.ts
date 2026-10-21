import { isDefined } from 'twenty-shared/utils';

type NodeWithChildNodes = {
  childNodes?: ArrayLike<unknown>;
};

export const resolveChildNodeIndexInParent = ({
  parent,
  child,
}: {
  parent: object;
  child: object;
}): number => {
  const childNodes = (parent as NodeWithChildNodes).childNodes;

  return isDefined(childNodes)
    ? Array.prototype.indexOf.call(childNodes, child)
    : -1;
};
