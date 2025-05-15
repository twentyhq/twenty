import { Key } from 'ts-key-enum';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useFocusedRecordTableRow } from '@/object-record/record-table/hooks/useFocusedRecordTableRow';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isAtLeastOneTableRowSelectedSelector } from '@/object-record/record-table/record-table-row/states/isAtLeastOneTableRowSelectedSelector';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
export const RecordTableBodyEscapeHotkeyEffect = () => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { resetTableRowSelection } = useRecordTable({
    recordTableId,
  });

  const { unfocusRecordTableRow } = useFocusedRecordTableRow(recordTableId);

  const isAtLeastOneRecordSelected = useRecoilComponentValueV2(
    isAtLeastOneTableRowSelectedSelector,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      unfocusRecordTableRow();
      if (isAtLeastOneRecordSelected) {
        resetTableRowSelection();
      }
    },
    TableHotkeyScope.Table,
    [isAtLeastOneRecordSelected, resetTableRowSelection, unfocusRecordTableRow],
  );

  return <></>;
};
