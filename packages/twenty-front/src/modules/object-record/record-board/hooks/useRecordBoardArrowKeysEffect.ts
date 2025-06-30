import { useRecordBoardCardNavigation } from '@/object-record/record-board/hooks/useRecordBoardCardNavigation';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { Key } from 'ts-key-enum';

export const useRecordBoardArrowKeysEffect = ({
  recordBoardId,
  focusId,
}: {
  recordBoardId: string;
  focusId: string;
}) => {
  const { move } = useRecordBoardCardNavigation(recordBoardId);

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowLeft],
    callback: () => move('left'),
    focusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [move],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowRight],
    callback: () => move('right'),
    focusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [move],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowUp],
    callback: () => move('up'),
    focusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [move],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowDown],
    callback: () => move('down'),
    focusId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [move],
  });
};
