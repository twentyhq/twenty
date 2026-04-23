import { useContext } from 'react';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardArrowKeysEffect } from '@/object-record/record-board/hooks/useRecordBoardArrowKeysEffect';
import { useRecordBoardCardHotkeys } from '@/object-record/record-board/hooks/useRecordBoardCardHotkeys';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { getRecordBoardCardFocusId } from '@/object-record/record-board/record-board-card/utils/getRecordBoardCardFocusId';

export const RecordBoardCardHotkeysEffect = () => {
  const { recordBoardId } = useContext(RecordBoardContext);
  const { rowIndex, columnIndex } = useContext(RecordBoardCardContext);

  const focusId = getRecordBoardCardFocusId({
    recordBoardId,
    cardIndexes: { rowIndex, columnIndex },
  });

  useRecordBoardCardHotkeys(focusId);
  useRecordBoardArrowKeysEffect({ recordBoardId, focusId });

  return null;
};
