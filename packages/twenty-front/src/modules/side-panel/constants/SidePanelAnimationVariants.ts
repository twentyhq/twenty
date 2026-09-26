import { themeCssVariables } from 'twenty-ui/theme';

export const SIDE_PANEL_ANIMATION_VARIANTS = {
  fullScreen: {
    x: '0%',
    width: '100%',
    height: '100%',
    bottom: '0',
    top: '0',
  },
  normal: {
    x: '0%',
    width: themeCssVariables.sidePanelWidth,
    height: '100%',
    bottom: '0',
    top: '0',
  },
  closed: {
    // Positive x leaves through the physical right. Callers in rtl pass -100%.
    x: '100%',
    width: themeCssVariables.sidePanelWidth,
    height: '100%',
    bottom: '0',
    top: 'auto',
  },
};
