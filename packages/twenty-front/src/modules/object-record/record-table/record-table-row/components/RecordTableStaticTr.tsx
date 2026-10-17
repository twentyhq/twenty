import { type ReactNode } from 'react';

import { RECORD_TABLE_ROW_NOT_DRAGGING_CONTEXT_VALUE } from '@/object-record/record-table/constants/RecordTableRowNotDraggingContextValue';
import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';

type RecordTableStaticTrProps = {
  recordId: string;
  focusIndex: number;
  children: ReactNode;
};

export const RecordTableStaticTr = ({
  recordId,
  focusIndex,
  children,
}: RecordTableStaticTrProps) => {
  return (
    <RecordTableTr
      recordId={recordId}
      focusIndex={focusIndex}
      isDragging={false}
      data-testid={`row-id-${recordId}`}
      data-selectable-id={recordId}
    >
      <RecordTableRowDraggableContextProvider
        value={RECORD_TABLE_ROW_NOT_DRAGGING_CONTEXT_VALUE}
      >
        {children}
      </RecordTableRowDraggableContextProvider>
    </RecordTableTr>
  );
};
