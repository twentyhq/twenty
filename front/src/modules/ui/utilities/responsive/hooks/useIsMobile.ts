import { useMediaQuery } from 'react-responsive';

import { MOBILE_VIEWPORT } from '@/ui/Themes/theme/constants/theme';

export const useIsMobile = () =>
  useMediaQuery({ query: `(max-width: ${MOBILE_VIEWPORT}px)` });
