import { isDefined } from 'twenty-shared/utils';

import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const measureViewportGeometry = (
  rootContainer: Element | null,
  defaultFontShorthand: string,
): ViewportGeometrySnapshot => {
  const rootContainerRect = isDefined(rootContainer)
    ? rootContainer.getBoundingClientRect()
    : null;

  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    rootContainerX: rootContainerRect?.x ?? 0,
    rootContainerY: rootContainerRect?.y ?? 0,
    rootContainerWidth: rootContainerRect?.width ?? 0,
    rootContainerHeight: rootContainerRect?.height ?? 0,
    rootContainerClientWidth: rootContainer?.clientWidth ?? 0,
    rootContainerClientHeight: rootContainer?.clientHeight ?? 0,
    defaultFontShorthand,
  };
};
