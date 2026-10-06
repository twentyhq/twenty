import { computeMidpointPosition } from 'twenty-shared/utils';

type CalculateNewPositionParams = {
  destinationIndex: number;
  items: Array<{ position: number }>;
};

export const calculateNewPosition = ({
  destinationIndex,
  items,
}: CalculateNewPositionParams): number => {
  if (destinationIndex === 0) {
    return items[0].position - 1;
  }

  if (destinationIndex === items.length) {
    return items[items.length - 1].position + 1;
  }

  return computeMidpointPosition({
    firstPosition: items[destinationIndex - 1].position,
    secondPosition: items[destinationIndex].position,
  });
};
