import { isNumber } from '@sniptt/guards';

import { type ElementScale } from '@/host/scroll/types/ElementScale';

const resolveScaleRatio = ({
  renderedSize,
  layoutSize,
}: {
  renderedSize: number;
  layoutSize: unknown;
}): number => {
  if (!isNumber(layoutSize) || layoutSize <= 0) {
    return 1;
  }

  const scaleRatio = renderedSize / layoutSize;

  return Number.isFinite(scaleRatio) && scaleRatio > 0 ? scaleRatio : 1;
};

export const resolveElementScale = (element: Element): ElementScale => {
  const { width, height } = element.getBoundingClientRect();
  const { offsetWidth, offsetHeight } = element as Partial<HTMLElement>;

  return {
    x: resolveScaleRatio({ renderedSize: width, layoutSize: offsetWidth }),
    y: resolveScaleRatio({ renderedSize: height, layoutSize: offsetHeight }),
  };
};
