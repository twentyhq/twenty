import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/components/RecordTableCellFieldContextWrapper';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableCell } from '@/object-record/record-table/record-table-cell/components/RecordTableCell';

export const RecordTableCellsVisible = () => {
  const { isDragging } = useContext(RecordTableRowContext);
  const { visibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  return visibleTableColumns.map((column, columnIndex) => (
    <RecordTableCellContext.Provider
      value={{
        columnDefinition: column,
        columnIndex,
      }}
      key={column.fieldMetadataId}
    >
      {isDragging && columnIndex > 0 ? null : (
        <RecordTableCellFieldContextWrapper>
          <RecordTableCell />
        </RecordTableCellFieldContextWrapper>
      )}
    </RecordTableCellContext.Provider>
  ));
};
