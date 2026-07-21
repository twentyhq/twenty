import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_FONT_SHORTHAND } from '@/host/constants/DefaultFontShorthand';

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

    const sizeAndLineHeight = isNonEmptyString(lineHeight)
      ? `${fontSize}/${lineHeight}`
      : fontSize;

    return [fontStyle, fontWeight, sizeAndLineHeight, fontFamily]
      .filter(isNonEmptyString)
      .join(' ');
  } catch {
    return DEFAULT_FONT_SHORTHAND;
  }
};
