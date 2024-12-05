import { Key } from 'ts-key-enum';

import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

type RecordTableBodyUnselectEffectProps = {
  tableBodyRef: React.RefObject<HTMLDivElement>;
  recordTableId: string;
};

export const RecordTableBodyUnselectEffect = ({
  tableBodyRef,
  recordTableId,
}: RecordTableBodyUnselectEffectProps) => {
  const leaveTableFocus = useLeaveTableFocus(recordTableId);

  const { resetTableRowSelection, useMapKeyboardToSoftFocus } = useRecordTable({
    recordTableId,
  });

  useMapKeyboardToSoftFocus();

  useScopedHotkeys(
    [Key.Escape],
    () => {
      resetTableRowSelection();
    },
    TableHotkeyScope.Table,
  );

  useListenClickOutside({
    excludeClassNames: [
      'bottom-bar',
      'action-menu-dropdown',
      'command-menu',
      'modal-backdrop',
    ],
    listenerId: RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
    refs: [tableBodyRef],
    callback: () => {
      leaveTableFocus();
    },
  });

  return <></>;
};
