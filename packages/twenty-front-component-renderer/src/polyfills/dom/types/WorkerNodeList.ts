export type WorkerNodeList<TNode = Node> = TNode[] & {
  item: (index: number) => TNode | null;
};
