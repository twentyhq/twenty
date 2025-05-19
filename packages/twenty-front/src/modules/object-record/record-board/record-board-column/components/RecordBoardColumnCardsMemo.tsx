import React from 'react';

import { RecordBoardCardDraggableContainer } from '@/object-record/record-board/record-board-card/components/RecordBoardCardDraggableContainer';

type RecordBoardColumnCardsMemoProps = {
  recordIds: string[];
};

export const RecordBoardColumnCardsMemo = React.memo(
  ({ recordIds }: RecordBoardColumnCardsMemoProps) => {
    return recordIds.map((recordId, index) => (
      <RecordBoardCardDraggableContainer
        key={recordId}
        recordId={recordId}
        rowIndex={index}
      />
    ));
  },
);
