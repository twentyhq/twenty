import { useMediaQuery } from 'react-responsive';

import { MOBILE_VIEWPORT } from '../modules/ui/themes/themes';

export function useIsMobile() {
  return useMediaQuery({ query: `(max-width: ${MOBILE_VIEWPORT}px)` });
}
