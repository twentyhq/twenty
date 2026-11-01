import { type ReactNode } from 'react';

import { RecordTableRowDraggableContextProvider } from '@/object-record/record-table/contexts/RecordTableRowDraggableContext';
import { RecordTableTr } from '@/object-record/record-table/record-table-row/components/RecordTableTr';

type RecordTableStaticTrProps = {
  recordId: string;
  children: ReactNode;
};

export const RecordTableStaticTr = ({
  recordId,
  children,
}: RecordTableStaticTrProps) => {
  return (
    <RecordTableTr
      recordId={recordId}
      isDragging={false}
      data-testid={`row-id-${recordId}`}
      data-selectable-id={recordId}
    >
      <RecordTableRowDraggableContextProvider value={{ isDragging: false }}>
        {children}
      </RecordTableRowDraggableContextProvider>
    </RecordTableTr>
  );
};
