export const calculateGridCellPosition = ({
  index,
  numberOfColumns,
}: {
  index: number;
  numberOfColumns: number;
}) => {
  const column = index % numberOfColumns;
  const row = Math.floor(index / numberOfColumns);

  return { row, column };
};
