export type WorkerNodeList = Node[] & {
  item: (index: number) => Node | null;
};
