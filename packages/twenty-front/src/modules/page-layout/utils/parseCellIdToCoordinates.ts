export type CellCoordinate = {
  col: number;
  row: number;
};

export const parseCellIdToCoordinates = (cellId: string): CellCoordinate => {
  const [, col, row] = cellId.split('-');
  return { col: Number(col), row: Number(row) };
};
