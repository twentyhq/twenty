import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useRecordBoardSelection } from '@/object-record/record-board/hooks/useRecordBoardSelection';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useResetFocusStackToRecordIndex } from '@/object-record/record-index/hooks/useResetFocusStackToRecordIndex';
import { RecordIndexHotkeyScope } from '@/object-record/record-index/types/RecordIndexHotkeyScope';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordBoardBodyEscapeHotkeyEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const { resetRecordSelection } = useRecordBoardSelection(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);
  const { resetFocusStackToRecordIndex } = useResetFocusStackToRecordIndex();

  const selectedRecordIds = useRecoilComponentValueV2(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const isAtLeastOneRecordSelected = selectedRecordIds.length > 0;

  const handleEscape = () => {
    unfocusBoardCard();
    if (isAtLeastOneRecordSelected) {
      resetRecordSelection();
    }
    resetFocusStackToRecordIndex();
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId: recordBoardId,
    scope: RecordIndexHotkeyScope.RecordIndex,
    dependencies: [handleEscape],
  });

  return null;
};
