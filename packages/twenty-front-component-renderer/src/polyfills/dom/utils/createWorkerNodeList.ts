import { type WorkerNodeList } from '@/polyfills/dom/types/WorkerNodeList';

class NodeListImplementation extends Array<Node> {
  item(index: number): Node | null {
    return this[index] ?? null;
  }
}

export const createWorkerNodeList = (nodes: Node[]): WorkerNodeList => {
  const nodeList = new NodeListImplementation();

  for (const node of nodes) {
    nodeList.push(node);
  }

  return nodeList;
};
