import { useMediaQuery } from 'react-responsive';

import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';

export function useIsMobile() {
  return useMediaQuery({ query: `(max-width: ${MOBILE_VIEWPORT}px)` });
}
