import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { BoardHotkeyScope } from '@/object-record/record-board/types/BoardHotkeyScope';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordBoardBodyEscapeHotkeyEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const { resetRecordSelection } = useRecordBoardSelection(recordBoardId);

  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const selectedRecordIds = useRecoilComponentValueV2(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const isAtLeastOneRecordSelected = selectedRecordIds.length > 0;

  useScopedHotkeys(
    [Key.Escape],
    () => {
      unfocusBoardCard();
      if (isAtLeastOneRecordSelected) {
        resetRecordSelection();
      }
    },
    RecordIndexHotkeyScope.RecordIndex,
    [isAtLeastOneRecordSelected, resetRecordSelection, unfocusBoardCard],
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      unfocusBoardCard();
      if (isAtLeastOneRecordSelected) {
        resetRecordSelection();
      }
    },
    BoardHotkeyScope.BoardFocus,
    [isAtLeastOneRecordSelected, resetRecordSelection, unfocusBoardCard],
  );

  return null;
};
