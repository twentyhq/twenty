export type CellCoordinate = {
  col: number;
  row: number;
};

export const parseCellIdToCoordinates = (cellId: string): CellCoordinate => {
  const [col, row] = cellId.split('-').slice(1).map(Number);
  return { col, row };
};
