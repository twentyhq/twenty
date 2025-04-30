import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useRecordTableRowContextOrThrow } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { useActiveRecordTableRow } from '@/object-record/record-table/hooks/useActiveRecordTableRow';
import { useSetCurrentRowSelected } from '@/object-record/record-table/record-table-row/hooks/useSetCurrentRowSelected';
import { TableHotkeyScope } from '@/object-record/record-table/types/TableHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Key } from 'ts-key-enum';

export const RecordTableRowHotkeyEffect = () => {
  const { isSelected, recordId, objectNameSingular, rowIndex } =
    useRecordTableRowContextOrThrow();

  const { setCurrentRowSelected } = useSetCurrentRowSelected();

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const { activateRecordTableRow } = useActiveRecordTableRow();

  useScopedHotkeys(
    'x',
    () => {
      setCurrentRowSelected(!isSelected);
    },
    TableHotkeyScope.TableFocus,
  );

  useScopedHotkeys(
    [`${Key.Control}+${Key.Enter}`, `${Key.Meta}+${Key.Enter}`],
    () => {
      openRecordInCommandMenu({
        recordId: recordId,
        objectNameSingular: objectNameSingular,
        isNewRecord: false,
      });

      activateRecordTableRow(rowIndex);
    },
    TableHotkeyScope.TableFocus,
  );

  return null;
};
