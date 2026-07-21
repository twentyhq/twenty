export type WelcomeHalftoneController = {
  leave: () => void;
  resize: (
    canvasWidth: number,
    canvasHeight: number,
    devicePixelRatio: number,
  ) => void;
  destroy: () => void;
};
