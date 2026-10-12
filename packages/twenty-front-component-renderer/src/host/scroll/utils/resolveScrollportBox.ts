import { type ElementScale } from '@/host/scroll/types/ElementScale';
import { type ScrollBox } from '@/host/scroll/types/ScrollBox';
import { resolveScrollLengthInPixels } from '@/host/scroll/utils/resolveScrollLengthInPixels';

export const resolveScrollportBox = ({
  scrollContainer,
  scrollContainerStyle,
  scale,
}: {
  scrollContainer: Element;
  scrollContainerStyle: CSSStyleDeclaration;
  scale: ElementScale;
}): ScrollBox => {
  const rect = scrollContainer.getBoundingClientRect();
  const { clientLeft, clientTop, clientWidth, clientHeight } = scrollContainer;
  const left = rect.left + clientLeft * scale.x;
  const top = rect.top + clientTop * scale.y;

  const readScrollPadding = ({
    length,
    referenceSize,
    axisScale,
  }: {
    length: string;
    referenceSize: number;
    axisScale: number;
  }): number =>
    resolveScrollLengthInPixels({ length, referenceSize }) * axisScale;

  return {
    top:
      top +
      readScrollPadding({
        length: scrollContainerStyle.scrollPaddingTop,
        referenceSize: clientHeight,
        axisScale: scale.y,
      }),
    right:
      left +
      clientWidth * scale.x -
      readScrollPadding({
        length: scrollContainerStyle.scrollPaddingRight,
        referenceSize: clientWidth,
        axisScale: scale.x,
      }),
    bottom:
      top +
      clientHeight * scale.y -
      readScrollPadding({
        length: scrollContainerStyle.scrollPaddingBottom,
        referenceSize: clientHeight,
        axisScale: scale.y,
      }),
    left:
      left +
      readScrollPadding({
        length: scrollContainerStyle.scrollPaddingLeft,
        referenceSize: clientWidth,
        axisScale: scale.x,
      }),
  };
};
