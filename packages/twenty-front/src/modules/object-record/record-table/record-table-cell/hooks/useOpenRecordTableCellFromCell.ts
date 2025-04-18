import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { useSetRecordTableFocusPosition } from '@/object-record/record-table/hooks/internal/useSetRecordTableFocusPosition';
import { TableHotkeyScope } from '../../types/TableHotkeyScope';

export const DEFAULT_CELL_SCOPE: HotkeyScope = {
  scope: TableHotkeyScope.CellEditMode,
};

export type OpenTableCellArgs = {
  initialValue?: string;
  cellPosition: TableCellPosition;
  isReadOnly: boolean;
  pathToShowPage: string;
  customCellHotkeyScope: HotkeyScope | null;
  fieldDefinition: FieldDefinition<FieldMetadata>;
  recordId: string;
};

export const useOpenRecordTableCellFromCell = () => {
  const { recordId, fieldDefinition, isReadOnly } = useContext(FieldContext);

  const { pathToShowPage, objectNameSingular } =
    useRecordTableRowContextOrThrow();

  const { onOpenTableCell } = useRecordTableBodyContextOrThrow();

  const { cellPosition } = useContext(RecordTableCellContext);

  const setFocusPosition = useSetRecordTableFocusPosition();

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

    setFocusPosition(cellPosition);
  };

  return {
    openTableCell,
  };
};
