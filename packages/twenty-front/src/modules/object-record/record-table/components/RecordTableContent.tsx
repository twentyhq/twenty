import { RecordTableColumnWidthEffect } from '@/object-record/record-table/components/RecordTableColumnWidthEffect';
import { RecordTableScrollAndZIndexEffect } from '@/object-record/record-table/components/RecordTableScrollAndZIndexEffect';
import {
  getRecordTableColumnWidthInlineStyles,
  RecordTableStyleWrapper,
} from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { RecordTableWidthEffect } from '@/object-record/record-table/components/RecordTableWidthEffect';
import { getRecordTableHtmlId } from '@/object-record/record-table/utils/getRecordTableHtmlId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableNoRecordGroupBody } from '@/object-record/record-table/record-table-body/components/RecordTableNoRecordGroupBody';
import { RecordTableRecordGroupsBody } from '@/object-record/record-table/record-table-body/components/RecordTableRecordGroupsBody';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { useMoveHoverToCurrentCell } from '@/object-record/record-table/record-table-cell/hooks/useMoveHoverToCurrentCell';
import { RecordSelectionDragSelect } from '@/object-record/record-selection/components/RecordSelectionDragSelect';
import { recordTableHoverPositionComponentState } from '@/object-record/record-table/states/recordTableHoverPositionComponentState';
import { isSomeCellInEditModeComponentSelector } from '@/object-record/record-table/states/selectors/isSomeCellInEditModeComponentSelector';
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
  position: relative;
  width: fit-content;
`;

export interface RecordTableContentProps {
  tableBodyRef: React.RefObject<HTMLDivElement | null>;
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

  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const store = useStore();

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

  const { moveHoverToCurrentCell } = useMoveHoverToCurrentCell(recordTableId);

  const handleDelegatedMouseMove = useCallback(
    (event: React.MouseEvent) => {
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

      moveHoverToCurrentCell({ column, row });
    },
    [moveHoverToCurrentCell],
  );

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

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
      <RecordSelectionDragSelect
        selectableItemsContainerRef={containerRef}
        onDragSelectionStart={handleDragStart}
        onDragSelectionEnd={handleDragEnd}
      />
    </StyledTableContainer>
  );
};
