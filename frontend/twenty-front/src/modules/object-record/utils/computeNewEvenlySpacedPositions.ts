export const computeNewEvenlySpacedPositions = ({
  startingPosition,
  endingPosition,
  numberOfRecordsToInsertBetween,
}: {
  startingPosition: number;
  endingPosition: number;
  numberOfRecordsToInsertBetween: number;
}) => {
  const positionGapSize = endingPosition - startingPosition;

  if (positionGapSize === 0) {
    return Array.from(
      { length: numberOfRecordsToInsertBetween },
      () => endingPosition,
    );
  }

  if (positionGapSize < 0) {
    throw new Error(
      `Cannot compute positions because starting position (${startingPosition}) is after ending position (${endingPosition})`,
    );
  }

  const positionStep = positionGapSize / (numberOfRecordsToInsertBetween + 1);

  let newPositionsBetween: number[] = [];

  for (let i = 1; i <= numberOfRecordsToInsertBetween; i++) {
    newPositionsBetween.push(startingPosition + positionStep * i);
  }

  return newPositionsBetween;
};
