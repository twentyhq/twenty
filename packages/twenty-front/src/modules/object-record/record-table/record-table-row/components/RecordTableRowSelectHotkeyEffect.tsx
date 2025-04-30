import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

export const RecordTableRowSelectHotkeyEffect = () => {
  const { isSelected } = useRecordTableRowContextOrThrow();

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  useScopedHotkeys(
    'x',
    () => {
      setCurrentRowSelected(!isSelected);
    },
    TableHotkeyScope.TableFocus,
  );

  return null;
};
