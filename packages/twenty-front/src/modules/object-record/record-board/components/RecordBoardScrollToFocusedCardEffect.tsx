import { useEffect } from 'react';

import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { isRecordBoardCardFocusActiveComponentState } from '@/object-record/record-board/states/isRecordBoardCardFocusActiveComponentState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const RecordBoardScrollToFocusedCardEffect = () => {
  const recordBoardId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
  );

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
