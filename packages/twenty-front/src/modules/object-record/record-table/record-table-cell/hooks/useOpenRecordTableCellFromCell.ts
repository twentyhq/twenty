import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { CellHotkeyScopeContext } from '@/object-record/record-table/contexts/CellHotkeyScopeContext';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useRecordTableBodyContextOrThrow } from '@/object-record/record-table/contexts/RecordTableBodyContext';
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
  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { pathToShowPage, objectNameSingular } =
    useRecordTableRowContextOrThrow();

  const { onOpenTableCell } = useRecordTableBodyContextOrThrow();

  const cellPosition = useCurrentTableCellPosition();

  const isFieldReadOnly = useIsFieldValueReadOnly();

  const openTableCell = (
    initialValue?: string,
    isActionButtonClick = false,
    isNavigating = false,
  ) => {
    onOpenTableCell({
      cellPosition,
      customCellHotkeyScope,
      recordId,
      fieldDefinition,
      isReadOnly: isFieldReadOnly,
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
