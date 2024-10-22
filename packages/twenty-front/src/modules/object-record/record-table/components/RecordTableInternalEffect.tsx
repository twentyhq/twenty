import { Key } from 'ts-key-enum';

import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutsideByClassName } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

type RecordTableInternalEffectProps = {
  recordTableId: string;
};

export const RecordTableInternalEffect = ({
  recordTableId,
}: RecordTableInternalEffectProps) => {
  const { leaveTableFocus, resetTableRowSelection, useMapKeyboardToSoftFocus } =
    useRecordTable({ recordTableId });

  useMapKeyboardToSoftFocus();

  useScopedHotkeys(
    [Key.Escape],
    () => {
      resetTableRowSelection();
    },
    TableHotkeyScope.Table,
  );

  useListenClickOutsideByClassName({
    classNames: ['entity-table-cell'],
    excludeClassNames: ['bottom-bar', 'action-menu-dropdown'],
    callback: () => {
      leaveTableFocus();
    },
  });

  return <></>;
};
