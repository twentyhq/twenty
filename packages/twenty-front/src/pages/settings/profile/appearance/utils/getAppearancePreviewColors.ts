import { SALESFARCE_APPEARANCE_VALUE } from '@/salesfarce/constants/SalesfarceAppearanceValue';
import { SALESFARCE_PREVIEW_COLORS } from '@/salesfarce/constants/SalesfarcePreviewColors';
import { type AppearanceValue } from '@/salesfarce/types/AppearanceValue';
import { GRAY_SCALE_DARK, GRAY_SCALE_LIGHT } from 'twenty-ui/theme';

export const getAppearancePreviewColors = (appearance: AppearanceValue) => {
  if (appearance === SALESFARCE_APPEARANCE_VALUE) {
    return SALESFARCE_PREVIEW_COLORS;
  }

  const grayScale = appearance === 'Dark' ? GRAY_SCALE_DARK : GRAY_SCALE_LIGHT;

  return {
    background: grayScale.gray4,
    border: grayScale.gray5,
    contentBackground: grayScale.gray1,
    contentColor: grayScale.gray12,
  };
};
