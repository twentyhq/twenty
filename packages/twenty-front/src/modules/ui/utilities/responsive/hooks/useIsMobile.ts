import { useMediaQuery } from 'react-responsive';

import { MOBILE_VIEWPORT } from '@/ui/theme/constants/MobileViewport';

export const useIsMobile = () =>
  useMediaQuery({ query: `(max-width: ${MOBILE_VIEWPORT}px)` });
