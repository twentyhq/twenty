export type WorkerActiveElementStore = {
  getActiveElement: () => object | null;
  getFocusVisibleElement: () => object | null;
  setActiveElement: (input: {
    element: object | null;
    isFocusVisible?: boolean;
  }) => void;
};
