import { useMemo } from 'react';

import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { RecordTableCellFieldContextWrapper } from '@/object-record/record-table/record-table-cell/components/RecordTableCellFieldContextWrapper';

export const RecordTableCellWrapper = ({
  children,
  recordField,
  recordFieldIndex,
}: {
  recordField: RecordField;
  recordFieldIndex: number;
  children: React.ReactNode;
}) => {
  const recordTableCellContextValue = useMemo(
    () => ({ recordField, columnIndex: recordFieldIndex }),
    [recordField, recordFieldIndex],
  );

  return (
    <RecordTableCellContext.Provider
      value={recordTableCellContextValue}
      key={recordField.fieldMetadataItemId}
    >
      <RecordTableCellFieldContextWrapper recordField={recordField}>
        {children}
      </RecordTableCellFieldContextWrapper>
    </RecordTableCellContext.Provider>
  );
};
