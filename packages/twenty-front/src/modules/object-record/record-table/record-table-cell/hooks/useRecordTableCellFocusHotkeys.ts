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

  const isActiveElementInput = () =>
    document.activeElement?.tagName === 'INPUT';

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowUp],
    callback: () => {
      if (isActiveElementInput()) return;
      moveFocus('up');
    },
    focusId,
    dependencies: [moveFocus],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowDown],
    callback: () => {
      if (isActiveElementInput()) return;
      moveFocus('down');
    },
    focusId,
    dependencies: [moveFocus],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowLeft],
    callback: () => {
      if (isActiveElementInput()) return;
      moveFocus('left');
    },
    focusId,
    dependencies: [moveFocus],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowRight],
    callback: () => {
      if (isActiveElementInput()) return;
      moveFocus('right');
    },
    focusId,
    dependencies: [moveFocus],
  });
};
