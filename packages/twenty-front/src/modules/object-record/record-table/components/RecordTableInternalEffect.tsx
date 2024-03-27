import { Key } from 'ts-key-enum';
import {
  useListenClickOutside,
  useListenClickOutsideByClassName,
  useScopedHotkeys,
} from 'twenty-ui';

import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';

type RecordTableInternalEffectProps = {
  recordTableId: string;
  tableBodyRef: React.RefObject<HTMLDivElement>;
};

export const RecordTableInternalEffect = ({
  recordTableId,
  tableBodyRef,
}: RecordTableInternalEffectProps) => {
  const { leaveTableFocus, resetTableRowSelection, useMapKeyboardToSoftFocus } =
    useRecordTable({ recordTableId });

  useMapKeyboardToSoftFocus();

  useListenClickOutside({
    refs: [tableBodyRef],
    callback: () => {
      leaveTableFocus();
    },
  });

  useScopedHotkeys(
    [Key.Escape],
    () => {
      resetTableRowSelection();
    },
    TableHotkeyScope.Table,
  );

  useListenClickOutsideByClassName({
    classNames: ['entity-table-cell'],
    excludeClassNames: ['action-bar', 'context-menu'],
    callback: () => {
      resetTableRowSelection();
    },
  });

  return <></>;
};
