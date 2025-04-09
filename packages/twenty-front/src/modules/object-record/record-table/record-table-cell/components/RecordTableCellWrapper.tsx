import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';

export const RecordTableCellWrapper = ({
  children,
  column,
  columnIndex,
}: {
  column: ColumnDefinition<FieldMetadata>;
  columnIndex: number;
  children: React.ReactNode;
}) => {
  // const { rowIndex } = useRecordTableRowContextOrThrow();

  // const currentTableCellPosition: TableCellPosition = useMemo(
  //   () => ({
  //     column: columnIndex,
  //     row: rowIndex,
  //   }),
  //   [columnIndex, rowIndex],
  // );

  // const isInEditMode = useRecoilComponentFamilyValueV2(
  //   isTableCellInEditModeComponentFamilyState,
  //   currentTableCellPosition,
  // );

  // const hasSoftFocus = useRecoilComponentFamilyValueV2(
  //   isSoftFocusOnTableCellComponentFamilyState,
  //   currentTableCellPosition,
  // );

  return (
    <RecordTableCellContext.Provider
      value={{
        columnDefinition: column,
        columnIndex,
        isInEditMode: false,
        hasSoftFocus: false,
        cellPosition: {
          column: columnIndex,
          row: 0,
        },
      }}
      key={column.fieldMetadataId}
    >
      <RecordTableCellFieldContextWrapper>
        {children}
      </RecordTableCellFieldContextWrapper>
    </RecordTableCellContext.Provider>
  );
};
