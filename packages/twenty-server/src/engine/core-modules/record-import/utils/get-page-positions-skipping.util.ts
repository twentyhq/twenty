// Positions of a page of rows when some positions are skipped, e.g. rows
// deleted in the review grid. skippedPositions must be sorted.
export const getPagePositionsSkipping = ({
  offset,
  pageSize,
  skippedPositions,
}: {
  offset: number;
  pageSize: number;
  skippedPositions: number[];
}): number[] => {
  const skipped = new Set(skippedPositions);
  let position = offset;

  for (const skippedPosition of skippedPositions) {
    if (skippedPosition > position) {
      break;
    }
    position++;
  }

  const positions: number[] = [];

  while (positions.length < pageSize) {
    if (!skipped.has(position)) {
      positions.push(position);
    }
    position++;
  }

  return positions;
};
