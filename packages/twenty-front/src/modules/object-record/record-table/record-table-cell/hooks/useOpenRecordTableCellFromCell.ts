import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';

export const useOpenRecordTableCellFromCell = () => {
  const {
    recordId,
    fieldDefinition,
    isRecordFieldReadOnly: isReadOnly,
  } = useContext(FieldContext);

  const { onOpenTableCell } = useRecordTableBodyContextOrThrow();

  const { cellPosition } = useContext(RecordTableCellContext);

  const openTableCell = (initialValue?: string, isNavigating = false) => {
    onOpenTableCell({
      cellPosition,
      recordId,
      fieldDefinition,
      isReadOnly,
      initialValue,
      isNavigating,
    });
  };

  return {
    openTableCell,
  };
};
