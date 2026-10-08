export const toZoomCompensatedCssLength = (pixels: number): string =>
  `calc(${pixels}px / var(--t-zoom, 1))`;
