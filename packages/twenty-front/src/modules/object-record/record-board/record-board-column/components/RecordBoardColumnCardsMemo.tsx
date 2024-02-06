import React from 'react';

import { RecordBoardCardDraggableContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardDraggableContainer';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';

type RecordBoardColumnCardsMemoProps = {
  recordIds: string[];
};

export const RecordBoardColumnCardsMemo = React.memo(
  ({ recordIds }: RecordBoardColumnCardsMemoProps) => {
    return recordIds.map((recordId, index) => (
      <RecordBoardCardContext.Provider value={{ recordId }} key={recordId}>
        <RecordBoardCardDraggableContainer recordId={recordId} index={index} />
      </RecordBoardCardContext.Provider>
    ));
  },
);
