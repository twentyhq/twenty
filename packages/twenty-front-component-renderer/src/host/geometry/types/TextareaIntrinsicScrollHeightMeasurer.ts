export type TextareaIntrinsicScrollHeightMeasurer = {
  measure: (node: Element) => number | undefined;
  dispose: () => void;
};
