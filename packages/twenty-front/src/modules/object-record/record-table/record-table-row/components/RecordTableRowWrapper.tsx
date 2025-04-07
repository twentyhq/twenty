import { ReactNode } from 'react';

import { RecordTableDraggableTr } from '@/object-record/record-table/record-table-row/components/RecordTableDraggableTr';

type RecordTableRowWrapperProps = {
  recordId: string;
  rowIndexForFocus: number;
  rowIndexForDrag: number;
  isPendingRow?: boolean;
  children: ReactNode;
};

export const RecordTableRowWrapper = ({
  recordId,
  rowIndexForFocus,
  rowIndexForDrag,
  isPendingRow,
  children,
}: RecordTableRowWrapperProps) => {
  return (
    <RecordTableDraggableTr
      key={recordId}
      draggableId={recordId}
      draggableIndex={rowIndexForDrag}
      focusIndex={rowIndexForFocus}
      isDragDisabled={isPendingRow}
    >
      {children}
    </RecordTableDraggableTr>
  );
};
