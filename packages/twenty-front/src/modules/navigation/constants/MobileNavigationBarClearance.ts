import { MOBILE_NAVIGATION_BAR_HEIGHT } from '@/navigation/constants/MobileNavigationBarHeight';
import { MOBILE_NAVIGATION_BAR_PADDING } from '@/navigation/constants/MobileNavigationBarPadding';

export const MOBILE_NAVIGATION_BAR_CLEARANCE = `calc(${MOBILE_NAVIGATION_BAR_HEIGHT} + 2 * ${MOBILE_NAVIGATION_BAR_PADDING} + env(safe-area-inset-bottom, 0px))`;
