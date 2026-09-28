import { isDefined } from 'twenty-shared/utils';
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
  const firstItem = items[0];
  const lastItem = items.at(-1);

  if (destinationIndex === 0 && isDefined(firstItem)) {
    return firstItem.position - 1;
  }

  if (destinationIndex === items.length && isDefined(lastItem)) {
    return lastItem.position + 1;
  }

  const destinationItem = items[destinationIndex];
  const itemBeforeDestination = items[destinationIndex - 1];

  if (!isDefined(destinationItem) || !isDefined(itemBeforeDestination)) {
    throw new Error(`Invalid destination index: ${destinationIndex}`);
  }

  if (destinationIndex > sourceIndex) {
    return (
      destinationItem.position +
      (itemBeforeDestination.position - destinationItem.position) / 2
    );
  }

  return (
    destinationItem.position -
    (destinationItem.position - itemBeforeDestination.position) / 2
  );
};
