import { useMediaQuery } from 'react-responsive';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme-constants';

const mobileMediaQuery = { query: `(max-width: ${MOBILE_VIEWPORT}px)` };

export const useIsMobile = () => useMediaQuery(mobileMediaQuery);
