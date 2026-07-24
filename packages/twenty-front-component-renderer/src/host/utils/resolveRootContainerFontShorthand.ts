import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_FONT_SHORTHAND } from '@/constants/DefaultFontShorthand';
import { assembleFontShorthandFromLonghands } from '@/utils/assembleFontShorthandFromLonghands';

export const resolveRootContainerFontShorthand = (
  rootContainer: Element | null,
): string => {
  if (!isDefined(rootContainer)) {
    return DEFAULT_FONT_SHORTHAND;
  }

  try {
    const computedStyle = window.getComputedStyle(rootContainer);
    const fontShorthand = computedStyle.font;

    if (isNonEmptyString(fontShorthand)) {
      return fontShorthand;
    }

    const { fontStyle, fontWeight, fontSize, lineHeight, fontFamily } =
      computedStyle;

    if (!isNonEmptyString(fontSize) || !isNonEmptyString(fontFamily)) {
      return DEFAULT_FONT_SHORTHAND;
    }

    return assembleFontShorthandFromLonghands({
      fontStyle,
      fontWeight,
      fontSize,
      lineHeight,
      fontFamily,
    });
  } catch {
    return DEFAULT_FONT_SHORTHAND;
  }
};
