import { isNumber } from '@sniptt/guards';

import { UNITLESS_CSS_PROPERTY_NAMES } from '@/constants/UnitlessCssPropertyNames';
import { isCssCustomPropertyName } from '@/utils/isCssCustomPropertyName';

export const formatCssValue = (
  value: unknown,
  stylePropertyName: string,
): string => {
  const shouldAppendPixelUnitToNumber =
    isNumber(value) &&
    value !== 0 &&
    !isCssCustomPropertyName(stylePropertyName) &&
    !UNITLESS_CSS_PROPERTY_NAMES.has(stylePropertyName);

  return shouldAppendPixelUnitToNumber ? `${value}px` : String(value);
};
