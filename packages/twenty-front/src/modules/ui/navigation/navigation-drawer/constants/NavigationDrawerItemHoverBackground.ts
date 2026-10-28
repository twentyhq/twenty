import { themeCssVariables } from 'twenty-ui/theme';

// Derived from the text color so hover stays a neutral tint in both themes,
// distinct from the accent-tinted active state.
export const NAVIGATION_DRAWER_ITEM_HOVER_BACKGROUND = `color-mix(in srgb, ${themeCssVariables.font.color.primary} 5%, transparent)`;
