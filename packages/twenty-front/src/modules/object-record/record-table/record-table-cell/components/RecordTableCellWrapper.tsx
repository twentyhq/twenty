import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useMemo } from 'react';

export const RecordTableCellWrapper = ({
  children,
  column,
  columnIndex,
}: {
  column: ColumnDefinition<FieldMetadata>;
  columnIndex: number;
  children: React.ReactNode;
}) => {
  const { rowIndex } = useRecordTableRowContextOrThrow();

  const currentTableCellPosition: TableCellPosition = useMemo(
    () => ({
      column: columnIndex,
      row: rowIndex,
    }),
    [columnIndex, rowIndex],
  );

  return (
    <RecordTableCellContext.Provider
      value={{
        columnDefinition: column,
        cellPosition: currentTableCellPosition,
      }}
      key={column.fieldMetadataId}
    >
      <RecordTableCellFieldContextWrapper>
        {children}
      </RecordTableCellFieldContextWrapper>
    </RecordTableCellContext.Provider>
  );
};
