import { RecordTableStickyBottomEffect } from '@/object-record/record-table/components/RecordTableStickyBottomEffect';
import { RecordTableStickyEffect } from '@/object-record/record-table/components/RecordTableStickyEffect';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { RecordTableNoRecordGroupBody } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBody';
import { RecordTableRecordGroupsBody } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupsBody';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isRecordTableScrolledHorizontallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledHorizontallyComponentState';
import { isRecordTableScrolledVerticallyComponentState } from '@/object-record/record-table/states/isRecordTableScrolledVerticallyComponentState';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS } from '@/ui/utilities/drag-select/constants/RecordIndecDragSelectBoundaryClass';
import { useRecoilComponentFamilyCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyCallbackState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { useRef, useState } from 'react';
import { useRecoilCallback } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const StyledTableWithPointerEvents = styled.div<{
  isDragging: boolean;
  stickyColumnZIndex: number;
  normalColumnZIndex: number;
}>`
  & > * {
    pointer-events: ${({ isDragging }) => (isDragging ? 'none' : 'auto')};
  }

  display: flex;
  flex-wrap: wrap;

  div.header-cell {
    position: sticky;
    top: 0;
  }

  div.header-cell:nth-of-type(n + 3) {
    z-index: ${({ normalColumnZIndex }) => normalColumnZIndex};
  }

  div.header-cell:nth-of-type(1) {
    // position: sticky;
    left: 0px;
    z-index: ${({ stickyColumnZIndex }) => stickyColumnZIndex};
    transition: 0.3s ease;
    background-color: ${({ theme }) => theme.background.primary};
  }

  div.header-cell:nth-of-type(2) {
    // position: sticky;
    left: 16px;
    top: 0;
    z-index: ${({ stickyColumnZIndex }) => stickyColumnZIndex};
    transition: 0.3s ease;
    background-color: ${({ theme }) => theme.background.primary};
  }

  div.header-cell:nth-of-type(3) {
    // position: sticky;
    left: 48px;
    right: 0;
    z-index: ${({ stickyColumnZIndex }) => stickyColumnZIndex};
    transition: 0.3s ease;
    background-color: ${({ theme }) => theme.background.primary};

    // &::after {
    //   content: '';
    //   position: absolute;
    //   top: -1px;
    //   height: calc(100% + 2px);
    //   width: 4px;
    //   right: 0px;
    //   box-shadow: ${({ theme }) => theme.boxShadow.light};
    //   clip-path: inset(0px -4px 0px 0px);
    // }

    @media (max-width: ${MOBILE_VIEWPORT}px) {
      width: 38px;
      max-width: 38px;
      min-width: 38px;
    }
  }

  div.footer-cell:nth-of-type(n + 3) {
    z-index: ${TABLE_Z_INDEX.footer.default};

    position: sticky;
    bottom: 0;
  }

  div.footer-cell:nth-of-type(1) {
    z-index: ${TABLE_Z_INDEX.footer.stickyColumn};
    left: 0px;
    bottom: 0;
    position: sticky;
  }

  div.footer-cell:nth-of-type(2) {
    z-index: ${TABLE_Z_INDEX.footer.stickyColumn};
    left: 48px;
    bottom: 0;
    position: sticky;
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

  const isRecordTableScrolledHorizontally = useRecoilComponentValue(
    isRecordTableScrolledHorizontallyComponentState,
  );

  const isRecordTableScrolledVertically = useRecoilComponentValue(
    isRecordTableScrolledVerticallyComponentState,
  );

  const computedStickyColumnZIndex =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally.headerColumnsSticky
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly.headerColumnsSticky
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly.headerColumnsSticky
          : TABLE_Z_INDEX.noScrollAtAll.headerColumnsSticky;

  const computedNormalColumnZIndex =
    isRecordTableScrolledHorizontally && isRecordTableScrolledVertically
      ? TABLE_Z_INDEX.scrolledBothVerticallyAndHorizontally.headerColumnsNormal
      : isRecordTableScrolledHorizontally
        ? TABLE_Z_INDEX.scrolledHorizontallyOnly.headerColumnsNormal
        : isRecordTableScrolledVertically
          ? TABLE_Z_INDEX.scrolledVerticallyOnly.headerColumnsNormal
          : TABLE_Z_INDEX.noScrollAtAll.headerColumnsNormal;

  return (
    <StyledTableContainer ref={containerRef}>
      <StyledTableWithPointerEvents
        ref={tableBodyRef}
        isDragging={isDragging}
        stickyColumnZIndex={computedStickyColumnZIndex}
        normalColumnZIndex={computedNormalColumnZIndex}
      >
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
