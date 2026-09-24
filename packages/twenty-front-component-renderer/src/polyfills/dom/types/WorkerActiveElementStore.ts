export type WorkerActiveElementStore = {
  getActiveElement: () => object | null;
  setActiveElement: (element: object | null) => void;
};
