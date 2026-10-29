import { GRAY_SCALE_LIGHT, THEME_LIGHT } from 'twenty-ui/theme';

import { SALESFARCE_PUMPKIN_IMAGE } from '@/salesfarce/constants/SalesfarcePumpkinImage';

export const SALESFARCE_PREVIEW_STYLE = {
  '--appearance-preview-background': THEME_LIGHT.color.sky4,
  '--appearance-preview-border': GRAY_SCALE_LIGHT.gray7,
  '--appearance-preview-content-background': `url("${SALESFARCE_PUMPKIN_IMAGE}") right 32px bottom 3px / 34px no-repeat, ${GRAY_SCALE_LIGHT.gray1}`,
  '--appearance-preview-content-color': THEME_LIGHT.color.cyan9,
};
