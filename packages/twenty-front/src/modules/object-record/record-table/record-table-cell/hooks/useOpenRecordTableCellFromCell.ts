import { useContext } from 'react';

import { getScopedRelationAlias } from '@/object-record/record-column-scope/utils/getScopedRelationAlias';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useGetRecordTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useGetRecordTableCellPosition';
import { isDefined } from 'twenty-shared/utils';

export const useOpenRecordTableCellFromCell = () => {
  const {
    recordId,
    fieldDefinition,
    isRecordFieldReadOnly: isReadOnly,
    scopedRelationViewFieldId,
  } = useContext(FieldContext);

  const { recordField } = useContext(RecordTableCellContext);

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
      recordFieldId: recordField.id,
      fieldValueKey: isDefined(scopedRelationViewFieldId)
        ? getScopedRelationAlias(scopedRelationViewFieldId)
        : undefined,
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
