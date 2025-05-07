import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useBoardCardNavigation } from '@/object-record/record-board/hooks/useBoardCardNavigation';
import { BoardHotkeyScope } from '@/object-record/record-board/types/BoardHotkeyScope';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
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
    RecordIndexHotkeyScope.RecordIndex,
  );

  useScopedHotkeys(
    Key.ArrowRight,
    () => {
      setHotkeyScopeAndMemorizePreviousScope(BoardHotkeyScope.BoardFocus);
      move('right');
    },
    RecordIndexHotkeyScope.RecordIndex,
  );

  useScopedHotkeys(
    Key.ArrowUp,
    () => {
      setHotkeyScopeAndMemorizePreviousScope(BoardHotkeyScope.BoardFocus);
      move('up');
    },
    RecordIndexHotkeyScope.RecordIndex,
  );

  useScopedHotkeys(
    Key.ArrowDown,
    () => {
      setHotkeyScopeAndMemorizePreviousScope(BoardHotkeyScope.BoardFocus);
      move('down');
    },
    RecordIndexHotkeyScope.RecordIndex,
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
