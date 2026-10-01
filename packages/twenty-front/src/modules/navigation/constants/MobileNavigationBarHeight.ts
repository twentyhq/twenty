import { themeCssVariables } from 'twenty-ui/theme';

// Mirrors NavigationBar's row: item height plus its padding and border.
export const MOBILE_NAVIGATION_BAR_HEIGHT = `calc(${themeCssVariables.spacing[10]} + 2 * ${themeCssVariables.spacing[1]} + 2px)`;
