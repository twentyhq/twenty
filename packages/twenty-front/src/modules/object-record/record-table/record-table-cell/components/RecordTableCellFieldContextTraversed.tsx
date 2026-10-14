import { useTraversedRecordFieldContextValue } from '@/object-record/record-field/hooks/useTraversedRecordFieldContextValue';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordTableCellFieldContextTraversedProps = {
  recordField: RecordField;
  children: ReactNode;
};

export const RecordTableCellFieldContextTraversed = ({
  recordField,
  children,
}: RecordTableCellFieldContextTraversedProps) => {
  const { recordId } = useRecordTableRowContextOrThrow();

  const fieldContextValue = useTraversedRecordFieldContextValue({
    recordField,
    rowRecordId: recordId,
  });

  if (!isDefined(fieldContextValue)) {
    return null;
  }

  return (
    <FieldContext.Provider
      value={{
        ...fieldContextValue,
        displayedMaxRows: 1,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
