import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordUpdateContext } from '@/object-record/record-table/contexts/EntityUpdateMutationHookContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { useContext, useMemo } from 'react';

export const RecordTableCellWrapper = ({
  children,
  column,
  columnIndex,
}: {
  column: ColumnDefinition<FieldMetadata>;
  columnIndex: number;
  children: React.ReactNode;
}) => {
  const { indexIdentifierUrl } = useRecordIndexContextOrThrow();
  const updateRecord = useContext(RecordUpdateContext);

  const { recordId, rowIndex } = useRecordTableRowContextOrThrow();
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const instanceId = getRecordFieldInputId(
    recordId,
    column.metadata.fieldName,
    'record-table-cell',
  );

  // const isLabelIdentifier = isLabelIdentifierField({
  //   fieldMetadataItem: {
  //     id: column.fieldMetadataId,
  //     name: column.metadata.fieldName,
  //   },
  //   objectMetadataItem,
  // });

  const currentTableCellPosition: TableCellPosition = useMemo(
    () => ({
      column: columnIndex,
      row: rowIndex,
    }),
    [columnIndex, rowIndex],
  );

  // const { isReadOnly: isTableRowReadOnly } = useRecordTableRowContextOrThrow();

  // const isFieldReadOnly = useIsFieldValueReadOnly({
  //   fieldDefinition: column,
  //   isRecordReadOnly: isTableRowReadOnly ?? false,
  // });

  return (
    <RecordTableCellContext.Provider
      value={{
        columnDefinition: column,
        cellPosition: currentTableCellPosition,
      }}
      key={column.fieldMetadataId}
    >
      <RecordFieldComponentInstanceContext.Provider value={{ instanceId }}>
        <FieldContext.Provider
          value={{
            recordId,
            fieldDefinition: column,
            useUpdateRecord: () => [updateRecord, {}],
            labelIdentifierLink: indexIdentifierUrl(recordId),
            isLabelIdentifier: isLabelIdentifierField({
              fieldMetadataItem: {
                id: column.fieldMetadataId,
                name: column.metadata.fieldName,
              },
              objectMetadataItem,
            }),
            displayedMaxRows: 1,
            isReadOnly: false, // isFieldReadOnly,
          }}
        >
          {children}
        </FieldContext.Provider>
      </RecordFieldComponentInstanceContext.Provider>
    </RecordTableCellContext.Provider>
  );
};
