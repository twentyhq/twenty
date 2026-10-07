import { type CSSProperties } from 'react';

import { FRONT_COMPONENT_PORTAL_MARGIN } from '@/constants/FrontComponentPortalMargin';

export const ROOT_CONTAINER_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  contain: 'layout',
  clipPath: `inset(-${FRONT_COMPONENT_PORTAL_MARGIN}px)`,
};
