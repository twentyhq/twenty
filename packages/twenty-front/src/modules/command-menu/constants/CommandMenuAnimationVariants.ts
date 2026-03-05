import { themeCssVariables } from 'twenty-ui/theme-constants';

export const COMMAND_MENU_ANIMATION_VARIANTS = {
  fullScreen: {
    x: '0%',
    width: '100%',
    height: '100%',
    bottom: '0',
    top: '0',
  },
  normal: {
    x: '0%',
    width: themeCssVariables.rightDrawerWidth,
    height: '100%',
    bottom: '0',
    top: '0',
  },
  closed: {
    x: '100%',
    width: themeCssVariables.rightDrawerWidth,
    height: '100%',
    bottom: '0',
    top: 'auto',
  },
};
