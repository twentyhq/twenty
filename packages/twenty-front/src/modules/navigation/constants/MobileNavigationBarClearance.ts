import { themeCssVariables } from 'twenty-ui/theme-constants';

// The bar floats over the page, so a surface that pins content to the bottom
// has to reserve what the bar covers: its own height plus the padding around it.
export const MOBILE_NAVIGATION_BAR_CLEARANCE = `calc(${themeCssVariables.spacing[14]} + 2 * ${themeCssVariables.spacing[3]} + env(safe-area-inset-bottom, 0px))`;
