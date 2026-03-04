import { useContext, useEffect } from 'react';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { isRecordBoardCardFocusActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCardFocusActiveComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordBoardScrollToFocusedCardEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);

  const focusedRecordBoardCardIndexes = useAtomComponentStateValue(
    focusedRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const isRecordBoardCardFocusActive = useAtomComponentStateValue(
    isRecordBoardCardFocusActiveComponentState,
    recordBoardId,
  );

  useEffect(() => {
    if (!isRecordBoardCardFocusActive || !focusedRecordBoardCardIndexes) {
      return;
    }

    const { rowIndex, columnIndex } = focusedRecordBoardCardIndexes;

    const focusElement = document.getElementById(
      `record-board-card-${columnIndex}-${rowIndex}`,
    );

    if (!focusElement) {
      return;
    }

    if (focusElement instanceof HTMLElement) {
      focusElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focusedRecordBoardCardIndexes, isRecordBoardCardFocusActive]);

  return null;
};
