import { type RecordField } from '@/object-record/record-field/types/RecordField';
import {
  RecordTableCellContext,
  type RecordTableCellContextValue,
} from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';
import { useMemo } from 'react';

export const RecordTableCellWrapper = ({
  children,
  recordField,
  recordFieldIndex,
}: {
  recordField: RecordField;
  recordFieldIndex: number;
  children: React.ReactNode;
}) => {
  const { rowIndex } = useRecordTableRowContextOrThrow();

  const cellContextValue: RecordTableCellContextValue = useMemo(
    () => ({
      recordField,
      cellPosition: {
        column: recordFieldIndex,
        row: rowIndex,
      },
    }),
    [recordField, recordFieldIndex, rowIndex],
  );

  return (
    <RecordTableCellContext.Provider
      value={cellContextValue}
      key={recordField.fieldMetadataItemId}
    >
      <RecordTableCellFieldContextWrapper recordField={recordField}>
        {children}
      </RecordTableCellFieldContextWrapper>
    </RecordTableCellContext.Provider>
  );
};
