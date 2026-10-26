import { type ElementScale } from '@/host/scroll/types/ElementScale';
import { type ScrollBox } from '@/host/scroll/types/ScrollBox';
import { resolveScrollLengthInPixels } from '@/host/scroll/utils/resolveScrollLengthInPixels';

export const resolveScrollportBox = ({
  scrollContainer,
  scrollContainerStyle,
  scale,
}: {
  scrollContainer: Pick<
    Element,
    | 'getBoundingClientRect'
    | 'clientLeft'
    | 'clientTop'
    | 'clientWidth'
    | 'clientHeight'
  >;
  scrollContainerStyle: Pick<
    CSSStyleDeclaration,
    | 'scrollPaddingTop'
    | 'scrollPaddingRight'
    | 'scrollPaddingBottom'
    | 'scrollPaddingLeft'
  >;
  scale: ElementScale;
}): ScrollBox => {
  const borderBoxRectangle = scrollContainer.getBoundingClientRect();
  const { clientLeft, clientTop, clientWidth, clientHeight } = scrollContainer;
  const left = borderBoxRectangle.left + clientLeft * scale.x;
  const top = borderBoxRectangle.top + clientTop * scale.y;
  const readBlockScrollPadding = (length: string): number =>
    resolveScrollLengthInPixels({ length, referenceSize: clientHeight }) *
    scale.y;
  const readInlineScrollPadding = (length: string): number =>
    resolveScrollLengthInPixels({ length, referenceSize: clientWidth }) *
    scale.x;

  return {
    top: top + readBlockScrollPadding(scrollContainerStyle.scrollPaddingTop),
    right:
      left +
      clientWidth * scale.x -
      readInlineScrollPadding(scrollContainerStyle.scrollPaddingRight),
    bottom:
      top +
      clientHeight * scale.y -
      readBlockScrollPadding(scrollContainerStyle.scrollPaddingBottom),
    left:
      left + readInlineScrollPadding(scrollContainerStyle.scrollPaddingLeft),
  };
};
