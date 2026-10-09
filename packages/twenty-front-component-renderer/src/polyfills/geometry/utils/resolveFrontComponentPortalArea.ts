import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_PORTAL_MARGIN } from '@/constants/FrontComponentPortalMargin';
import { type FrontComponentPortalArea } from '@/polyfills/geometry/types/FrontComponentPortalArea';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

export const resolveFrontComponentPortalArea = (
  viewport: ViewportGeometrySnapshot | null,
): FrontComponentPortalArea => {
  if (!isDefined(viewport)) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const left = Math.max(
    0,
    viewport.rootContainerX - FRONT_COMPONENT_PORTAL_MARGIN,
  );
  const top = Math.max(
    0,
    viewport.rootContainerY - FRONT_COMPONENT_PORTAL_MARGIN,
  );
  const right = Math.min(
    viewport.innerWidth,
    viewport.rootContainerX +
      viewport.rootContainerWidth +
      FRONT_COMPONENT_PORTAL_MARGIN,
  );
  const bottom = Math.min(
    viewport.innerHeight,
    viewport.rootContainerY +
      viewport.rootContainerHeight +
      FRONT_COMPONENT_PORTAL_MARGIN,
  );

  return {
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
};
