import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';

export const useRecordTableCellFocusHotkeys = ({
  focusId,
  hotkeyScope,
}: {
  focusId: string;
  hotkeyScope: string;
}) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { moveFocus } = useRecordTableMoveFocusedCell(recordTableId);

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowUp],
    callback: () => {
      moveFocus('up');
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [moveFocus],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowDown],
    callback: () => {
      moveFocus('down');
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [moveFocus],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowLeft],
    callback: () => {
      moveFocus('left');
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [moveFocus],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowRight],
    callback: () => {
      moveFocus('right');
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [moveFocus],
  });
};
