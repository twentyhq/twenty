import { type ElementScale } from '@/host/scroll/types/ElementScale';
import { type ScrollBox } from '@/host/scroll/types/ScrollBox';
import { resolveScrollLengthInPixels } from '@/host/scroll/utils/resolveScrollLengthInPixels';

const readScrollMargin = (length: string): number =>
  resolveScrollLengthInPixels({ length, referenceSize: 0 });

export const expandRectByScrollMargin = ({
  rect,
  style,
  scale,
}: {
  rect: ScrollBox;
  style: Pick<
    CSSStyleDeclaration,
    | 'scrollMarginTop'
    | 'scrollMarginRight'
    | 'scrollMarginBottom'
    | 'scrollMarginLeft'
  >;
  scale: ElementScale;
}): ScrollBox => ({
  top: rect.top - readScrollMargin(style.scrollMarginTop) * scale.y,
  right: rect.right + readScrollMargin(style.scrollMarginRight) * scale.x,
  bottom: rect.bottom + readScrollMargin(style.scrollMarginBottom) * scale.y,
  left: rect.left - readScrollMargin(style.scrollMarginLeft) * scale.x,
});
