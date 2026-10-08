import { type CSSProperties } from 'react';

import { FRONT_COMPONENT_PORTAL_MARGIN } from '@/constants/FrontComponentPortalMargin';
import { toZoomCompensatedCssLength } from '@/host/geometry/utils/toZoomCompensatedCssLength';

export const ROOT_CONTAINER_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  contain: 'layout',
  clipPath: `inset(${toZoomCompensatedCssLength(-FRONT_COMPONENT_PORTAL_MARGIN)})`,
};
