type DropTargetShape = {
  boundingRectangle: {
    top: number;
    height: number;
  };
};

export const resolveDropTarget = ({
  pointerY,
  cardPosition,
  cardShape,
}: {
  pointerY: number;
  cardPosition: number;
  cardShape: DropTargetShape;
}): {
  dropTargetIndex: number;
} => {
  const { top, height } = cardShape.boundingRectangle;
  const cardMidpointY = top + height / 2;

  const dropTargetIndex =
    pointerY < cardMidpointY ? cardPosition : cardPosition + 1;

  return { dropTargetIndex };
};
