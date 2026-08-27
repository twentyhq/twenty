import { isUndefined } from '@sniptt/guards';
import { type ThemeColor } from 'twenty-ui/theme';

import { THEME_COLOR_HEX } from 'src/front-components/constants/theme-color-hex.constant';
import { normalizeHexColor } from 'src/front-components/utils/normalize-hex-color.util';

export const getThemeColorFromHex = (
  value: string,
): ThemeColor | undefined => {
  const normalizedValue = normalizeHexColor(value);

  if (isUndefined(normalizedValue)) {
    return undefined;
  }

  return (Object.keys(THEME_COLOR_HEX) as ThemeColor[]).find(
    (colorName) => THEME_COLOR_HEX[colorName] === normalizedValue,
  );
};
