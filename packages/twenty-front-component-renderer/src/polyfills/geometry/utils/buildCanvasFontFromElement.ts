import { isFunction, isNonEmptyString } from '@sniptt/guards';

import { DEFAULT_FONT_FAMILY } from '@/constants/DefaultFontFamily';
import { DEFAULT_FONT_SIZE_PIXELS } from '@/constants/DefaultFontSizePixels';
import { type ElementWithStyle } from '@/polyfills/dom/types/ElementWithStyle';
import { assembleFontShorthandFromLonghands } from '@/utils/assembleFontShorthandFromLonghands';

type StyleDeclarationLike = {
  getPropertyValue?: (propertyName: string) => unknown;
};

const CSS_WIDE_KEYWORDS = new Set([
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
]);

const isCssWideKeyword = (value: string): boolean =>
  CSS_WIDE_KEYWORDS.has(value.trim().toLowerCase());

const readStyleProperty = (
  element: object,
  propertyName: string,
): string | null => {
  const style = (element as ElementWithStyle).style as
    | StyleDeclarationLike
    | undefined;

  if (!isFunction(style?.getPropertyValue)) {
    return null;
  }

  const value = style.getPropertyValue(propertyName);

  return isNonEmptyString(value) ? value : null;
};

export const buildCanvasFontFromElement = (
  element: object,
  defaultFontShorthand: string,
): string => {
  const fontShorthand = readStyleProperty(element, 'font');

  if (isNonEmptyString(fontShorthand) && !isCssWideKeyword(fontShorthand)) {
    return fontShorthand;
  }

  const fontSize = readStyleProperty(element, 'font-size');
  const fontFamily = readStyleProperty(element, 'font-family');
  const fontStyle = readStyleProperty(element, 'font-style');
  const fontWeight = readStyleProperty(element, 'font-weight');
  const lineHeight = readStyleProperty(element, 'line-height');

  const hasAnyFontProperty = [
    fontSize,
    fontFamily,
    fontStyle,
    fontWeight,
    lineHeight,
  ].some(isNonEmptyString);

  if (!hasAnyFontProperty) {
    return defaultFontShorthand;
  }

  return assembleFontShorthandFromLonghands({
    fontStyle,
    fontWeight,
    fontSize: fontSize ?? `${DEFAULT_FONT_SIZE_PIXELS}px`,
    lineHeight,
    fontFamily: fontFamily ?? DEFAULT_FONT_FAMILY,
  });
};
