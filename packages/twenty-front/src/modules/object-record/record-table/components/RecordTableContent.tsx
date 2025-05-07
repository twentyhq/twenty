import { RecordTableStickyBottomEffect } from '@/object-record/record-table/components/RecordTableStickyBottomEffect';
import { RecordTableStickyEffect } from '@/object-record/record-table/components/RecordTableStickyEffect';
import { StyledTable } from '@/object-record/record-table/components/RecordTableStyles';
import { RecordTableNoRecordGroupBody } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBody';
import { RecordTableRecordGroupsBody } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupsBody';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import styled from '@emotion/styled';
import { useState } from 'react';

const StyledTableWithPointerEvents = styled(StyledTable)<{
  isDragging: boolean;
}>`
  & > * {
    pointer-events: ${({ isDragging }) => (isDragging ? 'none' : 'auto')};
  }
`;

export interface RecordTableContentProps {
  tableBodyRef: React.RefObject<HTMLTableElement>;
  handleDragSelectionStart: () => void;
  handleDragSelectionEnd: () => void;
  setRowSelected: (rowId: string, selected: boolean) => void;
  hasRecordGroups: boolean;
}

export const RecordTableContent = ({
  tableBodyRef,
  handleDragSelectionStart,
  handleDragSelectionEnd,
  setRowSelected,
  hasRecordGroups,
}: RecordTableContentProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
    handleDragSelectionStart();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    handleDragSelectionEnd();
  };

  return (
    <>
      <StyledTableWithPointerEvents ref={tableBodyRef} isDragging={isDragging}>
        <RecordTableHeader />
        {hasRecordGroups ? (
          <RecordTableRecordGroupsBody />
        ) : (
          <RecordTableNoRecordGroupBody />
        )}
        <RecordTableStickyEffect />
        <RecordTableStickyBottomEffect />
      </StyledTableWithPointerEvents>
      <DragSelect
        dragSelectable={tableBodyRef}
        onDragSelectionStart={handleDragStart}
        onDragSelectionChange={setRowSelected}
        onDragSelectionEnd={handleDragEnd}
      />
    </>
  );
};
