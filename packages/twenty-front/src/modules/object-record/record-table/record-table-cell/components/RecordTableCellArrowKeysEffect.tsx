import { useCurrentlyFocusedRecordTableCellFocusId } from '@/object-record/record-table/record-table-cell/hooks/useCurrentlyFocusedRecordTableCellFocusId';
import { useRecordTableCellFocusHotkeys } from '@/object-record/record-table/record-table-cell/hooks/useRecordTableCellFocusHotkeys';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';

export const RecordTableCellArrowKeysEffect = () => {
  const recordTableCellFocusId = useCurrentlyFocusedRecordTableCellFocusId();

  useRecordTableCellFocusHotkeys({
    focusId: recordTableCellFocusId,
    hotkeyScope: TableHotkeyScope.TableFocus,
  });

  return null;
};
