import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useBoardCardNavigation } from '@/object-record/record-board/hooks/useBoardCardNavigation';
import { BoardHotkeyScope } from '@/object-record/record-board/types/BoardHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

export const RecordBoardCardFocusHotkeyEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const { move } = useBoardCardNavigation(recordBoardId);

  useScopedHotkeys(
    Key.ArrowLeft,
    () => {
      move('left');
    },
    BoardHotkeyScope.BoardFocus,
  );

  useScopedHotkeys(
    Key.ArrowRight,
    () => {
      move('right');
    },
    BoardHotkeyScope.BoardFocus,
  );

  useScopedHotkeys(
    Key.ArrowUp,
    () => {
      move('up');
    },
    BoardHotkeyScope.BoardFocus,
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      move('down');
    },
    BoardHotkeyScope.BoardFocus,
  );

  return null;
};
