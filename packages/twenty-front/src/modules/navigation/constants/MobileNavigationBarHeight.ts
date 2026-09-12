import { themeCssVariables } from 'twenty-ui/theme-constants';

// NavigationBar builds its row out of the item height plus its own padding and
// border, so the height has to be rebuilt from the same tokens here.
export const MOBILE_NAVIGATION_BAR_HEIGHT = `calc(${themeCssVariables.spacing[10]} + 2 * ${themeCssVariables.spacing[1]} + 2px)`;
