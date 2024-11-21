type CalculateNewPositionParams = {
  destinationIndex: number;
  sourceIndex: number;
  items: Array<{ position: number }>;
};

export const calculateNewPosition = ({
  destinationIndex,
  sourceIndex,
  items,
}: CalculateNewPositionParams): number => {
  if (destinationIndex === 0) {
    return items[0].position / 2;
  }

  if (destinationIndex === items.length - 1) {
    return items[destinationIndex - 1].position + 1;
  }

  if (destinationIndex > sourceIndex) {
    return (
      (items[destinationIndex + 1].position +
        items[destinationIndex].position) /
      2
    );
  }

  return (
    items[destinationIndex].position -
    (items[destinationIndex].position - items[destinationIndex - 1].position) /
      2
  );
};
