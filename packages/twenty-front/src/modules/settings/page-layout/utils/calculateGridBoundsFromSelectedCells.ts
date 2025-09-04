import { parseCellIdToCoordinates } from './parseCellIdToCoordinates';

export type GridBounds = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export const calculateGridBoundsFromSelectedCells = (
  selectedCellIds: string[],
): GridBounds | null => {
  if (selectedCellIds.length === 0) {
    return null;
  }

  const cellCoords = selectedCellIds.map(parseCellIdToCoordinates);

  const minCol = Math.min(...cellCoords.map((c) => c.col));
  const maxCol = Math.max(...cellCoords.map((c) => c.col));
  const minRow = Math.min(...cellCoords.map((c) => c.row));
  const maxRow = Math.max(...cellCoords.map((c) => c.row));

  return {
    x: minCol,
    y: minRow,
    w: maxCol - minCol + 1,
    h: maxRow - minRow + 1,
  };
};
