import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useGetRecordTableRowIndex } from '@/object-record/record-table/record-table-row/hooks/useGetRecordTableRowIndex';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

export const useGetRecordTableCellPosition = () => {
  const { columnIndex } = useContext(RecordTableCellContext);
  const { getRecordTableRowIndex } = useGetRecordTableRowIndex();

  const getRecordTableCellPosition = (): TableCellPosition | null => {
    const rowIndex = getRecordTableRowIndex();

    return isDefined(rowIndex) ? { row: rowIndex, column: columnIndex } : null;
  };

  return { getRecordTableCellPosition };
};
