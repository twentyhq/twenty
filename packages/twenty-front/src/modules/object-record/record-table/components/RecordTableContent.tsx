import { RecordTableColumnWidthEffect } from '@/object-record/record-table/components/RecordTableColumnWidthEffect';
import { RecordTableScrollAndZIndexEffect } from '@/object-record/record-table/components/RecordTableScrollAndZIndexEffect';
import { RecordTableStyleWrapper } from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { RecordTableWidthEffect } from '@/object-record/record-table/components/RecordTableWidthEffect';
import { RECORD_TABLE_HTML_ID } from '@/object-record/record-table/constants/RecordTableHtmlId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableNoRecordGroupBody } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBody';
import { RecordTableRecordGroupsBody } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupsBody';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS } from '@/ui/utilities/drag-select/constants/RecordIndecDragSelectBoundaryClass';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useRecoilCallback } from 'recoil';

const StyledTableContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: fit-content;
`;

export interface RecordTableContentProps {
  tableBodyRef: React.RefObject<HTMLDivElement>;
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

  const recordTableScrollWrapperId = `record-table-scroll-${recordTableId}`;

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const setRecordTableHoverPosition = useSetRecoilComponentState(
    recordTableHoverPositionComponentState,
  );

  const isSomeCellInEditModeCallbackState = useRecoilComponentCallbackState(
    isSomeCellInEditModeComponentSelector,
  );

  const handleMouseLeave = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isSomeCellInEditMode = getSnapshotValue(
          snapshot,
          isSomeCellInEditModeCallbackState,
        );

        if (!isSomeCellInEditMode) {
          setRecordTableHoverPosition(null);
        }
      },
    [isSomeCellInEditModeCallbackState, setRecordTableHoverPosition],
  );

  return (
    <StyledTableContainer ref={containerRef}>
      <RecordTableStyleWrapper
        ref={tableBodyRef}
        isDragging={isDragging}
        visibleRecordFields={visibleRecordFields}
        id={RECORD_TABLE_HTML_ID}
        onMouseLeave={handleMouseLeave}
        hasRecordGroups={hasRecordGroups}
      >
        <RecordTableHeader />
        {hasRecordGroups ? (
          <RecordTableRecordGroupsBody />
        ) : (
          <RecordTableNoRecordGroupBody />
        )}
        <RecordTableScrollAndZIndexEffect />
        <RecordTableColumnWidthEffect />
        <RecordTableWidthEffect />
      </RecordTableStyleWrapper>
      <DragSelect
        selectableItemsContainerRef={containerRef}
        onDragSelectionStart={handleDragStart}
        onDragSelectionChange={handleDragSelectionChange}
        onDragSelectionEnd={handleDragEnd}
        scrollWrapperComponentInstanceId={recordTableScrollWrapperId}
        selectionBoundaryClass={RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS}
      />
    </StyledTableContainer>
  );
};
