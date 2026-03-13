import { RecordTableRowDiv } from '@/object-record/record-table/record-table-row/components/RecordTableRowDiv';
import { forwardRef, type ReactNode } from 'react';

type RecordTableTrProps = {
  children: ReactNode;
  recordId: string;
  isDragging?: boolean;
};

export const RecordTableFirstRowOfGroup = forwardRef<
  HTMLDivElement,
  RecordTableTrProps
>(({ children, recordId, isDragging = false, ...props }, ref) => {
  return (
    <RecordTableRowDiv
      className="table-row"
      data-virtualized-id={recordId}
      isDragging={isDragging}
      ref={ref}
      // oxlint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </RecordTableRowDiv>
  );
});
