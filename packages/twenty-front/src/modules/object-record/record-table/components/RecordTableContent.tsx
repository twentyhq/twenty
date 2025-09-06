import { RecordTableStickyBottomEffect } from '@/object-record/record-table/components/RecordTableStickyBottomEffect';
import { RecordTableStickyEffect } from '@/object-record/record-table/components/RecordTableStickyEffect';
import { StyledTableDiv } from '@/object-record/record-table/components/RecordTableStyles';
import { RecordTableNoRecordGroupBody } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBody';
import { RecordTableRecordGroupsBody } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupsBody';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS } from '@/ui/utilities/drag-select/constants/RecordIndecDragSelectBoundaryClass';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useRecoilCallback } from 'recoil';

const StyledTableWithPointerEvents = styled(StyledTableDiv)<{
  isDragging: boolean;
}>`
  & > * {
    pointer-events: ${({ isDragging }) => (isDragging ? 'none' : 'auto')};
  }
`;

const StyledTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

export interface RecordTableContentProps {
  tableBodyRef: React.RefObject<HTMLTableElement>;
  handleDragSelectionStart: () => void;
  handleDragSelectionEnd: () => void;
  hasRecordGroups: boolean;
  recordTableId: string;
}

export const RecordTableContent = ({
  tableBodyRef,
  handleDragSelectionStart,
  handleDragSelectionEnd,
  hasRecordGroups,
  recordTableId,
}: RecordTableContentProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = () => {
    setIsDragging(true);
    handleDragSelectionStart();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    handleDragSelectionEnd();
  };

  const isRowSelectedCallbackFamilyState =
    useRecoilComponentFamilyCallbackState(isRowSelectedComponentFamilyState);

  const handleDragSelectionChange = useRecoilCallback(
    ({ set }) =>
      (rowId: string, selected: boolean) => {
        set(isRowSelectedCallbackFamilyState(rowId), selected);
      },
    [isRowSelectedCallbackFamilyState],
  );

  return (
    <StyledTableContainer ref={containerRef}>
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
        selectableItemsContainerRef={containerRef}
        onDragSelectionStart={handleDragStart}
        onDragSelectionChange={handleDragSelectionChange}
        onDragSelectionEnd={handleDragEnd}
        scrollWrapperComponentInstanceId={`record-table-scroll-${recordTableId}`}
        selectionBoundaryClass={RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS}
      />
    </StyledTableContainer>
  );
};
