import { type WorkerNodeList } from '@/polyfills/dom/types/WorkerNodeList';

class NodeListImplementation<TNode> extends Array<TNode> {
  item(index: number): TNode | null {
    return this[index] ?? null;
  }
}

export const createWorkerNodeList = <TNode = Node>(
  nodes: TNode[],
): WorkerNodeList<TNode> => {
  const nodeList = new NodeListImplementation<TNode>();

  for (const node of nodes) {
    nodeList.push(node);
  }

  return nodeList;
};
