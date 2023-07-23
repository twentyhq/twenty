import { useMediaQuery } from 'react-responsive';

import { MOBILE_VIEWPORT } from '@/ui/themes/themes';

export function useIsMobile() {
  return useMediaQuery({ query: `(max-width: ${MOBILE_VIEWPORT}px)` });
}
