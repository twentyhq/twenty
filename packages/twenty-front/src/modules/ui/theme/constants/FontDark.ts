import { COLOR } from '@/ui/theme/constants/Colors';
import { FONT_COMMON } from '@/ui/theme/constants/FontCommon';
import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';

export const FONT_DARK = {
  color: {
    primary: GRAY_SCALE.gray20,
    secondary: GRAY_SCALE.gray35,
    tertiary: GRAY_SCALE.gray45,
    light: GRAY_SCALE.gray50,
    extraLight: GRAY_SCALE.gray55,
    inverted: GRAY_SCALE.gray100,
    danger: COLOR.red,
  },
  ...FONT_COMMON,
};
