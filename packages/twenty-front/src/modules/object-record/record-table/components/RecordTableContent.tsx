import { RecordTableResizeEffect } from '@/object-record/record-table/components/RecordTableResizeEffect';
import { RecordTableScrollAndZIndexEffect } from '@/object-record/record-table/components/RecordTableScrollAndZIndexEffect';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
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
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

export const RECORD_TABLE_HTML_ID = 'record-table';

const StyledTable = styled.div<{
  isDragging: boolean;
}>`
  & > * {
    pointer-events: ${({ isDragging }) => (isDragging ? 'none' : 'auto')};
  }

  display: flex;
  flex-wrap: wrap;
  width: 100%;

  div.header-cell {
    position: sticky;
    top: 0;
  }

  div.header-cell:nth-of-type(n + 5) {
    z-index: ${TABLE_Z_INDEX.headerColumnsNormal};
  }

  div.header-cell:nth-of-type(1) {
    left: 0px;

    background-color: ${({ theme }) => theme.background.primary};

    z-index: ${TABLE_Z_INDEX.headerColumnsSticky};
  }

  div.header-cell:nth-of-type(2) {
    left: 16px;
    top: 0;

    background-color: ${({ theme }) => theme.background.primary};

    z-index: ${TABLE_Z_INDEX.headerColumnsSticky};
  }

  div.header-cell:nth-of-type(3) {
    left: 48px;
    right: 0;

    background-color: ${({ theme }) => theme.background.primary};

    z-index: ${TABLE_Z_INDEX.headerColumnsSticky};

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

  // TODO: re-implement horizontal scroll here after table have been refactored to divs
  div.table-cell:nth-of-type(1) {
    position: sticky;
    left: 0px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell:nth-of-type(2) {
    position: sticky;
    left: 16px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};
  }

  div.table-cell-0-0 {
    position: sticky;
    left: 48px;

    @media (max-width: ${MOBILE_VIEWPORT}px) {
      width: ${38}px;
      max-width: ${38}px;
    }
  }

  div.table-cell:nth-of-type(3) {
    position: sticky;
    left: 48px;
    z-index: ${TABLE_Z_INDEX.cell.sticky};

    @media (max-width: ${MOBILE_VIEWPORT}px) {
      width: ${38}px;
      max-width: ${38}px;
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

  return (
    <StyledTableContainer ref={containerRef}>
      <StyledTable
        ref={tableBodyRef}
        isDragging={isDragging}
        id={RECORD_TABLE_HTML_ID}
      >
        <RecordTableHeader />
        {hasRecordGroups ? (
          <RecordTableRecordGroupsBody />
        ) : (
          <RecordTableNoRecordGroupBody />
        )}
        <RecordTableScrollAndZIndexEffect />
        <RecordTableResizeEffect />
      </StyledTable>
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
