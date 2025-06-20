import { useRecordTableRowFocusHotkeys } from '@/object-record/record-table/hooks/useRecordTableRowFocusHotkeys';
import { useRecordTableRowFocusId } from '@/object-record/record-table/record-table-row/hooks/useRecordTableRowFocusId';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';

export const RecordTableRowArrowKeysEffect = () => {
  const recordTableRowFocusId = useRecordTableRowFocusId();

  useRecordTableRowFocusHotkeys({
    focusId: recordTableRowFocusId,
    hotkeyScope: TableHotkeyScope.TableFocus,
  });

  return null;
};
