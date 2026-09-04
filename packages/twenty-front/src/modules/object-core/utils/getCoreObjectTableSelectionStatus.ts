export const getCoreObjectTableSelectionStatus = ({
  rowIds,
  selectedRowIds,
}: {
  rowIds: string[];
  selectedRowIds: string[];
}) => {
  const selectedRowIdsInTable = rowIds.filter((rowId) =>
    selectedRowIds.includes(rowId),
  );

  const areAllRowsSelected =
    rowIds.length > 0 && selectedRowIdsInTable.length === rowIds.length;

  const areSomeRowsSelected =
    selectedRowIdsInTable.length > 0 && !areAllRowsSelected;

  return { areAllRowsSelected, areSomeRowsSelected };
};
