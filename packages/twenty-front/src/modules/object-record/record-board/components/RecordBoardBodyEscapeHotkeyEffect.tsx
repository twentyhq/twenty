import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { isAtLeastOneRecordSelectedComponentSelector } from '@/object-record/record-selection/states/selectors/isAtLeastOneRecordSelectedComponentSelector';
import { useResetFocusStackToRecordIndex } from '@/object-record/record-index/hooks/useResetFocusStackToRecordIndex';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const RecordBoardBodyEscapeHotkeyEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const { resetRecordSelection } = useResetRecordSelection(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);
  const { resetFocusStackToRecordIndex } = useResetFocusStackToRecordIndex();

  const isAtLeastOneRecordSelected = useAtomComponentSelectorValue(
    isAtLeastOneRecordSelectedComponentSelector,
    recordBoardId,
  );

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
    focusId: PageFocusId.RecordIndex,
    dependencies: [handleEscape],
  });

  return null;
};
