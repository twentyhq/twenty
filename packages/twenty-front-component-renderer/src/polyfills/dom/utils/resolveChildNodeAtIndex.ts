type ResolveChildNodeAtIndexInput = {
  parent: Node;
  index: number;
};

export const resolveChildNodeAtIndex = ({
  parent,
  index,
}: ResolveChildNodeAtIndexInput): Node | null => {
  const { childNodes } = parent;

  if (index < 0 || index >= childNodes.length) {
    return null;
  }

  return childNodes.item(index) ?? null;
};
