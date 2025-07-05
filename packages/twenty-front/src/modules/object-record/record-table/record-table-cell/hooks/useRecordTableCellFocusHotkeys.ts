import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTableMoveFocusedCell } from '@/object-record/record-table/hooks/useRecordTableMoveFocusedCell';
import { recordTableCellEditModePositionComponentState } from '@/object-record/record-table/states/recordTableCellEditModePositionComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
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

  const currentTableCellInEditModePosition = useRecoilComponentValueV2(
    recordTableCellEditModePositionComponentState,
  );

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowUp],
    callback: () => {
      // Don't handle arrow keys when a cell is in edit mode
      if (currentTableCellInEditModePosition) {
        return;
      }
      moveFocus('up');
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [moveFocus, currentTableCellInEditModePosition],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowDown],
    callback: () => {
      // Don't handle arrow keys when a cell is in edit mode
      if (currentTableCellInEditModePosition) {
        return;
      }
      moveFocus('down');
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [moveFocus, currentTableCellInEditModePosition],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowLeft],
    callback: () => {
      // Don't handle arrow keys when a cell is in edit mode
      if (currentTableCellInEditModePosition) {
        return;
      }
      moveFocus('left');
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [moveFocus, currentTableCellInEditModePosition],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowRight],
    callback: () => {
      // Don't handle arrow keys when a cell is in edit mode
      if (currentTableCellInEditModePosition) {
        return;
      }
      moveFocus('right');
    },
    focusId,
    scope: hotkeyScope,
    dependencies: [moveFocus, currentTableCellInEditModePosition],
  });
};
