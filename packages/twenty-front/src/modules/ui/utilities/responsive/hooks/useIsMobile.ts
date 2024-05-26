import { useMediaQuery } from 'react-responsive';
import { MOBILE_VIEWPORT } from 'twenty-ui';

export const useIsMobile = () =>
  useMediaQuery({ query: `(max-width: ${MOBILE_VIEWPORT}px)` });
