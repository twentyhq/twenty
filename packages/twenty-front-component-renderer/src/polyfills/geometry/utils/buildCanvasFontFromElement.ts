import { isNonEmptyString } from '@sniptt/guards';

type StyleDeclarationLike = {
  getPropertyValue?: (propertyName: string) => unknown;
};

type ElementWithStyle = {
  style?: unknown;
};

const readStyleProperty = (
  element: object,
  propertyName: string,
): string | null => {
  const style = (element as ElementWithStyle).style as
    | StyleDeclarationLike
    | undefined;

  if (typeof style?.getPropertyValue !== 'function') {
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

  if (isNonEmptyString(fontShorthand)) {
    return fontShorthand;
  }

  const fontSize = readStyleProperty(element, 'font-size');
  const fontFamily = readStyleProperty(element, 'font-family');

  if (!isNonEmptyString(fontSize) && !isNonEmptyString(fontFamily)) {
    return defaultFontShorthand;
  }

  const fontStyle = readStyleProperty(element, 'font-style');
  const fontWeight = readStyleProperty(element, 'font-weight');
  const lineHeight = readStyleProperty(element, 'line-height');

  const resolvedFontSize = fontSize ?? '13px';
  const sizeAndLineHeight = isNonEmptyString(lineHeight)
    ? `${resolvedFontSize}/${lineHeight}`
    : resolvedFontSize;

  return [fontStyle, fontWeight, sizeAndLineHeight, fontFamily ?? 'sans-serif']
    .filter(isNonEmptyString)
    .join(' ');
};
