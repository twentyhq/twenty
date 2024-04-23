import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldDefinition } from '@/object-record/record-field/types/FieldDefinition';
import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { CellHotkeyScopeContext } from '@/object-record/record-table/contexts/CellHotkeyScopeContext';
import { RecordTableContext } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useCurrentTableCellPosition } from '@/object-record/record-table/record-table-cell/hooks/useCurrentCellPosition';
import { TableCellPosition } from '@/object-record/record-table/types/TableCellPosition';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

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
  entityId: string;
};

export const useOpenRecordTableCellFromCell = () => {
  const { onOpenTableCell } = useContext(RecordTableContext);
  const cellPosition = useCurrentTableCellPosition();
  const customCellHotkeyScope = useContext(CellHotkeyScopeContext);
  const { entityId, fieldDefinition } = useContext(FieldContext);
  const { isReadOnly, pathToShowPage } = useContext(RecordTableRowContext);

  const openTableCell = (initialValue?: string) => {
    onOpenTableCell({
      cellPosition,
      customCellHotkeyScope,
      entityId,
      fieldDefinition,
      isReadOnly,
      pathToShowPage,
      initialValue,
    });
  };

  return {
    openTableCell,
  };
};
