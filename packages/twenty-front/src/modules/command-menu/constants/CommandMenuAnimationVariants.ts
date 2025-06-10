import { THEME_COMMON } from 'twenty-ui/theme';
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
    width: THEME_COMMON.rightDrawerWidth,
    height: '100%',
    bottom: '0',
    top: '0',
  },
  closed: {
    x: '100%',
    width: THEME_COMMON.rightDrawerWidth,
    height: '100%',
    bottom: '0',
    top: 'auto',
  },
};
