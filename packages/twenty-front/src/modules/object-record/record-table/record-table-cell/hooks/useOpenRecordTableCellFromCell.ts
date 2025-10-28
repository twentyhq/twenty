import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { type TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';

import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';

export type OpenTableCellArgs = {
  initialValue?: string;
  cellPosition: TableCellPosition;
  isReadOnly: boolean;
  pathToShowPage: string;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  recordId: string;
};

export const useOpenRecordTableCellFromCell = () => {
  const {
    recordId,
    fieldDefinition,
    isRecordFieldReadOnly: isReadOnly,
  } = useContext(FieldContext);

  const { pathToShowPage, objectNameSingular } =
    useRecordTableRowContextOrThrow();

  const { onOpenTableCell } = useRecordTableBodyContextOrThrow();

  const { cellPosition } = useContext(RecordTableCellContext);

  const openTableCell = (
    initialValue?: string,
    isActionButtonClick = false,
    isNavigating = false,
  ) => {
    onOpenTableCell({
      cellPosition,
      recordId,
      fieldDefinition,
      isReadOnly,
      pathToShowPage,
      objectNameSingular,
      initialValue,
      isActionButtonClick,
      isNavigating,
    });
  };

  return {
    openTableCell,
  };
};
