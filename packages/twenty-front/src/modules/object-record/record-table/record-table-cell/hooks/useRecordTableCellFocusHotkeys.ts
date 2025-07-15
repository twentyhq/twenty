import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';

export const useRecordTableCellFocusHotkeys = ({
  focusId,
}: {
  focusId: string;
}) => {
  const { recordTableId } = useRecordTableContextOrThrow();

  const { moveFocus } = useRecordTableMoveFocusedCell(recordTableId);

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowUp],
    callback: () => {
      moveFocus('up');
    },
    focusId,
    dependencies: [moveFocus],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowDown],
    callback: () => {
      moveFocus('down');
    },
    focusId,
    dependencies: [moveFocus],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowLeft],
    callback: () => {
      moveFocus('left');
    },
    focusId,
    dependencies: [moveFocus],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowRight],
    callback: () => {
      moveFocus('right');
    },
    focusId,
    dependencies: [moveFocus],
  });
};
