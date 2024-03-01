import { BORDER_COMMON } from '@/ui/theme/constants/BorderCommon';
import { COLOR } from '@/ui/theme/constants/Colors';
import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';

export const BORDER_DARK = {
  color: {
    strong: GRAY_SCALE.gray55,
    medium: GRAY_SCALE.gray65,
    light: GRAY_SCALE.gray70,
    secondaryInverted: GRAY_SCALE.gray35,
    inverted: GRAY_SCALE.gray20,
    danger: COLOR.red70,
  },
  ...BORDER_COMMON,
};
