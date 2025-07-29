import { useEffect } from 'react';

import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { isRecordBoardCardFocusActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCardFocusActiveComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordBoardScrollToFocusedCardEffect = () => {
  const focusedCardIndexes = useRecoilComponentValueV2(
    focusedRecordBoardCardIndexesComponentState,
  );

  const isFocusActive = useRecoilComponentValueV2(
    isRecordBoardCardFocusActiveComponentState,
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
