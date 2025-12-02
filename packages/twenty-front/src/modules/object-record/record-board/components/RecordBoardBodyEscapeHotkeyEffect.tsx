import { useContext } from 'react';
import { Key } from 'ts-key-enum';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { useResetRecordBoardSelection } from '@/object-record/record-board/hooks/useResetRecordBoardSelection';
import { recordBoardSelectedRecordIdsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardSelectedRecordIdsComponentSelector';
import { useResetFocusStackToRecordIndex } from '@/object-record/record-index/hooks/useResetFocusStackToRecordIndex';
import { PageFocusId } from '@/types/PageFocusId';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

export const RecordBoardBodyEscapeHotkeyEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const { resetRecordBoardSelection } =
    useResetRecordBoardSelection(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);
  const { resetFocusStackToRecordIndex } = useResetFocusStackToRecordIndex();

  const selectedRecordIds = useRecoilComponentValue(
    recordBoardSelectedRecordIdsComponentSelector,
    recordBoardId,
  );

  const isAtLeastOneRecordSelected = selectedRecordIds.length > 0;

  const handleEscape = () => {
    unfocusBoardCard();

    if (isAtLeastOneRecordSelected) {
      resetRecordBoardSelection();
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
