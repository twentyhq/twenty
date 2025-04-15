import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { isFocusOnTableCellComponentFamilyState } from '@/object-record/record-table/states/isFocusOnTableCellComponentFamilyState';
import { isTableCellInEditModeComponentFamilyState } from '@/object-record/record-table/states/isTableCellInEditModeComponentFamilyState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
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

  const isInEditMode = useRecoilComponentFamilyValueV2(
    isTableCellInEditModeComponentFamilyState,
    currentTableCellPosition,
  );

  const hasFocus = useRecoilComponentFamilyValueV2(
    isFocusOnTableCellComponentFamilyState,
    currentTableCellPosition,
  );

  return (
    <RecordTableCellContext.Provider
      value={{
        columnDefinition: column,
        columnIndex,
        isInEditMode,
        hasFocus,
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
