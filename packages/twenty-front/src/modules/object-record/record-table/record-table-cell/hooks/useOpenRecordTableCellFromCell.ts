import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { useGetRecordTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useGetRecordTableCellPosition';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRecordTableCellFromCell = () => {
  const {
    recordId,
    fieldDefinition,
    isRecordFieldReadOnly: isReadOnly,
  } = useContext(FieldContext);

  const { onOpenTableCell } = useRecordTableBodyContextOrThrow();

  const { getRecordTableCellPosition } = useGetRecordTableCellPosition();

  const openTableCell = (initialValue?: string, isNavigating = false) => {
    const cellPosition = getRecordTableCellPosition();

    if (!isDefined(cellPosition)) {
      return;
    }

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
