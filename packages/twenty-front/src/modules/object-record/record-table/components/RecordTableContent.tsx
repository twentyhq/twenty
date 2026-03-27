import { RecordTableColumnWidthEffect } from '@/object-record/record-table/components/RecordTableColumnWidthEffect';
import { RecordTableScrollAndZIndexEffect } from '@/object-record/record-table/components/RecordTableScrollAndZIndexEffect';
import {
  getRecordTableColumnWidthInlineStyles,
  RecordTableStyleWrapper,
} from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { isRecordTableCheckboxColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableCheckboxColumnHiddenComponentState';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { RecordTableWidthEffect } from '@/object-record/record-table/components/RecordTableWidthEffect';
import { getRecordTableHtmlId } from '@/object-record/record-table/utils/getRecordTableHtmlId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableNoRecordGroupBody } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBody';
import { RecordTableRecordGroupsBody } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupsBody';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { RECORD_INDEX_DRAG_SELECT_BOUNDARY_CLASS } from '@/ui/utilities/drag-select/constants/RecordIndecDragSelectBoundaryClass';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useStore } from 'jotai';
import { useCallback, useMemo, useRef, useState } from 'react';

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

  const isRowSelectedFamilyState = useAtomComponentFamilyStateCallbackState(
    isRowSelectedComponentFamilyState,
    recordTableId,
  );

  const store = useStore();

  const handleDragSelectionChange = useCallback(
    (rowId: string, selected: boolean) => {
      store.set(isRowSelectedFamilyState(rowId), selected);
    },
    [isRowSelectedFamilyState, store],
  );

  const recordTableScrollWrapperId = `record-table-scroll-${recordTableId}`;

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordTableHoverPositionCallbackState =
    useAtomComponentStateCallbackState(
      recordTableHoverPositionComponentState,
      recordTableId,
    );

  const isSomeCellInEditMode = useAtomComponentSelectorCallbackState(
    isSomeCellInEditModeComponentSelector,
    recordTableId,
  );

  const handleMouseLeave = useCallback(() => {
    const cellInEditMode = store.get(isSomeCellInEditMode);

    if (!cellInEditMode) {
      store.set(recordTableHoverPositionCallbackState, null);
    }
  }, [store, isSomeCellInEditMode, recordTableHoverPositionCallbackState]);

  const handleDelegatedMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (store.get(isSomeCellInEditMode)) {
        return;
      }

      const target = event.target as HTMLElement;
      const cellElement = target.closest<HTMLElement>(
        '[data-record-table-col]',
      );

      if (!cellElement) {
        return;
      }

      const column = Number(cellElement.dataset.recordTableCol);
      const row = Number(cellElement.dataset.recordTableRow);

      if (isNaN(column) || isNaN(row)) {
        return;
      }

      const lastPosition = store.get(recordTableHoverPositionCallbackState);

      if (lastPosition?.column === column && lastPosition?.row === row) {
        return;
      }

      store.set(recordTableHoverPositionCallbackState, { column, row });
    },
    [store, isSomeCellInEditMode, recordTableHoverPositionCallbackState],
  );

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden = useAtomComponentStateValue(
    isRecordTableCheckboxColumnHiddenComponentState,
  );

  const columnWidthStyles = useMemo(
    () =>
      getRecordTableColumnWidthInlineStyles({
        visibleRecordFields,
        isDragColumnHidden: isRecordTableDragColumnHidden,
        isCheckboxColumnHidden: isRecordTableCheckboxColumnHidden,
      }),
    [
      visibleRecordFields,
      isRecordTableDragColumnHidden,
      isRecordTableCheckboxColumnHidden,
    ],
  );

  return (
    <StyledTableContainer ref={containerRef}>
      <RecordTableStyleWrapper
        ref={tableBodyRef}
        isDragging={isDragging}
        style={columnWidthStyles}
        id={getRecordTableHtmlId(recordTableId)}
        onMouseMove={handleDelegatedMouseMove}
        onMouseLeave={handleMouseLeave}
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
