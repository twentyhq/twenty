import { type ReactNode } from 'react';

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
        value={{
          isDragging: false,
          dragHandleProps: null,
        }}
      >
        {children}
      </RecordTableRowDraggableContextProvider>
    </RecordTableTr>
  );
};
