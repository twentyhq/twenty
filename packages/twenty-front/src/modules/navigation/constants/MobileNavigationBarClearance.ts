import { MOBILE_NAVIGATION_BAR_HEIGHT } from '@/navigation/constants/MobileNavigationBarHeight';
import { MOBILE_NAVIGATION_BAR_PADDING } from '@/navigation/constants/MobileNavigationBarPadding';

// The bar floats over the page, so a surface that pins content to the bottom
// has to reserve what it covers.
export const MOBILE_NAVIGATION_BAR_CLEARANCE = `calc(${MOBILE_NAVIGATION_BAR_HEIGHT} + 2 * ${MOBILE_NAVIGATION_BAR_PADDING} + env(safe-area-inset-bottom, 0px))`;
