import { type ElementScale } from '@/host/scroll/types/ElementScale';
import { type ScrollBox } from '@/host/scroll/types/ScrollBox';
import { resolveScrollLengthInPixels } from '@/host/scroll/utils/resolveScrollLengthInPixels';

export const expandRectByScrollMargin = ({
  rect,
  style,
  scale,
}: {
  rect: DOMRect;
  style: CSSStyleDeclaration;
  scale: ElementScale;
}): ScrollBox => {
  const readScrollMargin = ({
    length,
    axisScale,
  }: {
    length: string;
    axisScale: number;
  }): number =>
    resolveScrollLengthInPixels({ length, referenceSize: 0 }) * axisScale;

  return {
    top:
      rect.top -
      readScrollMargin({ length: style.scrollMarginTop, axisScale: scale.y }),
    right:
      rect.right +
      readScrollMargin({ length: style.scrollMarginRight, axisScale: scale.x }),
    bottom:
      rect.bottom +
      readScrollMargin({
        length: style.scrollMarginBottom,
        axisScale: scale.y,
      }),
    left:
      rect.left -
      readScrollMargin({ length: style.scrollMarginLeft, axisScale: scale.x }),
  };
};
