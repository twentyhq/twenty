const SMOOTHING_PASS_COUNT = 4;

type HiddenRunInterpolation = {
  values: Float32Array;
  weights: Float32Array;
};

const interpolateHiddenRuns = (
  luminances: Float32Array,
  isHiddenCell: Uint8Array,
  lineCount: number,
  lineLength: number,
  getCellIndex: (line: number, position: number) => number,
): HiddenRunInterpolation => {
  const values = new Float32Array(luminances.length);
  const weights = new Float32Array(luminances.length);

  for (let line = 0; line < lineCount; line++) {
    let position = 0;

    while (position < lineLength) {
      if (isHiddenCell[getCellIndex(line, position)] === 0) {
        position++;
        continue;
      }

      const runStart = position;
      while (
        position < lineLength &&
        isHiddenCell[getCellIndex(line, position)] === 1
      ) {
        position++;
      }
      const runEnd = position - 1;

      const hasStartNeighbor = runStart > 0;
      const hasEndNeighbor = runEnd < lineLength - 1;
      if (!hasStartNeighbor && !hasEndNeighbor) {
        continue;
      }

      const startLuminance = hasStartNeighbor
        ? luminances[getCellIndex(line, runStart - 1)]
        : luminances[getCellIndex(line, runEnd + 1)];
      const endLuminance = hasEndNeighbor
        ? luminances[getCellIndex(line, runEnd + 1)]
        : startLuminance;
      const runLength = runEnd - runStart + 1;

      for (let runPosition = runStart; runPosition <= runEnd; runPosition++) {
        const distanceFromStart = runPosition - runStart + 1;
        const distanceFromEnd = runEnd - runPosition + 1;
        // A run that touches the grid edge only has one known side, so it is
        // trusted half as much as a run bounded on both sides.
        const distanceToKnownNeighbor =
          hasStartNeighbor && hasEndNeighbor
            ? Math.min(distanceFromStart, distanceFromEnd)
            : 2 * (hasStartNeighbor ? distanceFromStart : distanceFromEnd);
        const cellIndex = getCellIndex(line, runPosition);

        values[cellIndex] =
          startLuminance +
          ((endLuminance - startLuminance) * distanceFromStart) /
            (runLength + 1);
        weights[cellIndex] =
          1 / (distanceToKnownNeighbor * distanceToKnownNeighbor);
      }
    }
  }

  return { values, weights };
};

type FillOnboardingHomeIllustrationRoomArgs = {
  luminances: Float32Array;
  isFurnitureCell: Uint8Array;
  columns: number;
  rows: number;
};

export const fillOnboardingHomeIllustrationRoom = ({
  luminances,
  isFurnitureCell,
  columns,
  rows,
}: FillOnboardingHomeIllustrationRoomArgs): Float32Array => {
  const horizontalInterpolation = interpolateHiddenRuns(
    luminances,
    isFurnitureCell,
    rows,
    columns,
    (row, column) => row * columns + column,
  );
  const verticalInterpolation = interpolateHiddenRuns(
    luminances,
    isFurnitureCell,
    columns,
    rows,
    (column, row) => row * columns + column,
  );

  const roomLuminances = Float32Array.from(luminances);

  for (let cellIndex = 0; cellIndex < luminances.length; cellIndex++) {
    if (isFurnitureCell[cellIndex] === 0) {
      continue;
    }

    const horizontalWeight = horizontalInterpolation.weights[cellIndex];
    const verticalWeight = verticalInterpolation.weights[cellIndex];
    const totalWeight = horizontalWeight + verticalWeight;

    roomLuminances[cellIndex] =
      totalWeight > 0
        ? (horizontalInterpolation.values[cellIndex] * horizontalWeight +
            verticalInterpolation.values[cellIndex] * verticalWeight) /
          totalWeight
        : 1;
  }

  for (let pass = 0; pass < SMOOTHING_PASS_COUNT; pass++) {
    const previousLuminances = Float32Array.from(roomLuminances);

    for (let row = 1; row < rows - 1; row++) {
      for (let column = 1; column < columns - 1; column++) {
        const cellIndex = row * columns + column;
        if (isFurnitureCell[cellIndex] === 0) {
          continue;
        }

        roomLuminances[cellIndex] =
          (previousLuminances[cellIndex] * 4 +
            previousLuminances[cellIndex - 1] +
            previousLuminances[cellIndex + 1] +
            previousLuminances[cellIndex - columns] +
            previousLuminances[cellIndex + columns]) /
          8;
      }
    }
  }

  return roomLuminances;
};
