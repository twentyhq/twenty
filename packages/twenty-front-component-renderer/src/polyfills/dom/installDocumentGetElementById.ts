type NodeLike = {
  childNodes?: ArrayLike<unknown>;
  getAttribute?: (attributeName: string) => string | null;
};

type DocumentWithGetElementById = NodeLike & {
  getElementById?: unknown;
};

export const installDocumentGetElementById = (
  documentTarget: DocumentWithGetElementById,
): void => {
  if (typeof documentTarget.getElementById === 'function') {
    return;
  }

  documentTarget.getElementById = (elementId: string) => {
    const pendingNodes: NodeLike[] = [documentTarget];

    while (pendingNodes.length > 0) {
      const currentNode = pendingNodes.shift() as NodeLike;

      if (
        typeof currentNode.getAttribute === 'function' &&
        currentNode.getAttribute('id') === elementId
      ) {
        return currentNode;
      }

      const childNodes = currentNode.childNodes;

      if (childNodes !== undefined) {
        for (let index = 0; index < childNodes.length; index += 1) {
          pendingNodes.push(childNodes[index] as NodeLike);
        }
      }
    }

    return null;
  };
};
