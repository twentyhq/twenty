import { useContext, useEffect } from 'react';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { isRecordBoardCardFocusActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCardFocusActiveComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';

export const RecordBoardScrollToFocusedCardEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const focusedCardIndexes = useRecoilComponentValueV2(
    focusedRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const isFocusActive = useRecoilComponentValueV2(
    isRecordBoardCardFocusActiveComponentState,
    recordBoardId,
  );

  useEffect(() => {
    if (!isFocusActive || !focusedCardIndexes) {
      return;
    }

    const { rowIndex, columnIndex } = focusedCardIndexes;

    const focusElement = document.getElementById(
      `record-board-card-${columnIndex}-${rowIndex}`,
    );

    if (!focusElement) {
      return;
    }

    if (focusElement instanceof HTMLElement) {
      focusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedCardIndexes, isFocusActive]);

  return null;
};
