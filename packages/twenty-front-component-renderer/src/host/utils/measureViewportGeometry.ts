import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_FONT_SHORTHAND } from '@/host/constants/DefaultFontShorthand';
import { type ViewportGeometrySnapshot } from '@/types/ViewportGeometrySnapshot';

const readRootContainerFontShorthand = (rootContainer: Element): string => {
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

export const measureViewportGeometry = (
  rootContainer: Element | null,
): ViewportGeometrySnapshot => {
  const rootContainerRect = isDefined(rootContainer)
    ? rootContainer.getBoundingClientRect()
    : null;

  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    rootContainerX: rootContainerRect?.x ?? 0,
    rootContainerY: rootContainerRect?.y ?? 0,
    rootContainerWidth: rootContainerRect?.width ?? 0,
    rootContainerHeight: rootContainerRect?.height ?? 0,
    rootContainerClientWidth: rootContainer?.clientWidth ?? 0,
    rootContainerClientHeight: rootContainer?.clientHeight ?? 0,
    defaultFontShorthand: isDefined(rootContainer)
      ? readRootContainerFontShorthand(rootContainer)
      : DEFAULT_FONT_SHORTHAND,
  };
};
