import { useRecordBoardCardNavigation } from '@/object-record/record-board/hooks/useRecordBoardCardNavigation';
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
    dependencies: [move],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowRight],
    callback: () => move('right'),
    focusId,
    dependencies: [move],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowUp],
    callback: () => move('up'),
    focusId,
    dependencies: [move],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.ArrowDown],
    callback: () => move('down'),
    focusId,
    dependencies: [move],
  });
};
