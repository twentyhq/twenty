import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useBoardCardNavigation } from '@/object-record/record-board/hooks/useBoardCardNavigation';
import { BoardHotkeyScope } from '@/object-record/record-board/types/BoardHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

export const RecordBoardHotkeyEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const { move } = useBoardCardNavigation(recordBoardId);

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  useScopedHotkeys(
    Key.ArrowLeft,
    () => {
      setHotkeyScopeAndMemorizePreviousScope(BoardHotkeyScope.BoardFocus);
      move('left');
    },
    BoardHotkeyScope.Board,
  );

  useScopedHotkeys(
    Key.ArrowRight,
    () => {
      setHotkeyScopeAndMemorizePreviousScope(BoardHotkeyScope.BoardFocus);
      move('right');
    },
    BoardHotkeyScope.Board,
  );

  useScopedHotkeys(
    Key.ArrowUp,
    () => {
      setHotkeyScopeAndMemorizePreviousScope(BoardHotkeyScope.BoardFocus);
      move('up');
    },
    BoardHotkeyScope.Board,
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      setHotkeyScopeAndMemorizePreviousScope(BoardHotkeyScope.BoardFocus);
      move('down');
    },
    BoardHotkeyScope.Board,
  );

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
