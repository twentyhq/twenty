import { Key } from 'ts-key-enum';

import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useLeaveTableFocus } from '@/object-record/record-table/hooks/internal/useLeaveTableFocus';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutsideV2 } from '@/ui/utilities/pointer-event/hooks/useListenClickOutsideV2';

type RecordTableInternalEffectProps = {
  recordTableId: string;
  tableBodyRef: React.RefObject<HTMLDivElement>;
};

export const RecordTableInternalEffect = ({
  recordTableId,
  tableBodyRef,
}: RecordTableInternalEffectProps) => {
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

  useListenClickOutsideV2({
    listenerId: RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
    refs: [tableBodyRef],
    callback: () => {
      leaveTableFocus();
    },
  });

  return <></>;
};
