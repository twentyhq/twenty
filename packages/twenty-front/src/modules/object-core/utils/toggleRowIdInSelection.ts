export const toggleRowIdInSelection = ({
  selectedRowIds,
  rowId,
}: {
  selectedRowIds: string[];
  rowId: string;
}) =>
  selectedRowIds.includes(rowId)
    ? selectedRowIds.filter((selectedRowId) => selectedRowId !== rowId)
    : [...selectedRowIds, rowId];
