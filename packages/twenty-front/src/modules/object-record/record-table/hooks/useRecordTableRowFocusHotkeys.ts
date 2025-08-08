import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedRow } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedRow';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';

export const useRecordTableRowFocusHotkeys = ({
  focusId,
}: {
  focusId: string;
}) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { moveFocusedRow } = useRecordTableMoveFocusedRow(recordTableId);

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowUp, `${Key.Shift}+${Key.Enter}`, 'k'],
    callback: () => {
      moveFocusedRow('up');
    },
    focusId,
    dependencies: [moveFocusedRow],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowDown, 'j'],
    callback: () => {
      moveFocusedRow('down');
    },
    focusId,
    dependencies: [moveFocusedRow],
  });
};
