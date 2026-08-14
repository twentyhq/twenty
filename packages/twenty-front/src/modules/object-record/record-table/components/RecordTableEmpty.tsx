import { RecordTableColumnWidthEffect } from '@/object-record/record-table/components/RecordTableColumnWidthEffect';
import {
  getRecordTableColumnWidthInlineStyles,
  RecordTableStyleWrapper,
} from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { RecordTableWidthEffect } from '@/object-record/record-table/components/RecordTableWidthEffect';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { getRecordTableHtmlId } from '@/object-record/record-table/utils/getRecordTableHtmlId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { computeVisibleRecordFieldsWidthOnTable } from '@/object-record/record-table/utils/computeVisibleRecordFieldsWidthOnTable';
import { RecordTableVirtualizedDataChangedEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDataChangedEffect';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useMemo, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext, MOBILE_VIEWPORT } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledEmptyStateContainer = styled.div<{ width: number }>`
  height: 100%;
  overflow: hidden;
  width: ${({ width }) => width}px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

export interface RecordTableEmptyProps {
  tableBodyRef: React.RefObject<HTMLDivElement | null>;
}

export const RecordTableEmpty = ({ tableBodyRef }: RecordTableEmptyProps) => {
  const { theme } = useContext(ThemeContext);

  const { visibleRecordFields, recordTableId } = useRecordTableContextOrThrow();

  const isMobile = useIsMobile();

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

  const recordTableWidth = useAtomComponentStateValue(
    recordTableWidthComponentState,
  );

  const resizedFieldMetadataId = useAtomComponentStateValue(
    resizedFieldMetadataIdComponentState,
  );

  const resizeFieldOffset = useAtomComponentStateValue(
    resizeFieldOffsetComponentState,
  );

  const isResizing = isDefined(resizedFieldMetadataId);

  const shouldCompactRecordTableFirstColumn = useAtomComponentStateValue(
    shouldCompactRecordTableFirstColumnComponentState,
  );

  const resizeOffsetToAddOnlyIfItMakesTableContainerGrow = isResizing
    ? resizeFieldOffset > 0
      ? resizeFieldOffset
      : 0
    : 0;

  const totalColumnsBorderWidth = visibleRecordFields.length;

  const { visibleRecordFieldsWidth } = computeVisibleRecordFieldsWidthOnTable({
    shouldCompactFirstColumn: shouldCompactRecordTableFirstColumn,
    visibleRecordFields,
    uiScale: theme.scale,
  });

  const dragColumnWidth = isRecordTableDragColumnHidden
    ? 0
    : RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH * theme.scale;

  const checkboxColumnWidth = isRecordTableCheckboxColumnHidden
    ? 0
    : RECORD_TABLE_COLUMN_CHECKBOX_WIDTH * theme.scale;

  const leftColumnsWidth = dragColumnWidth + checkboxColumnWidth;

  const emptyTableContainerComputedWidth =
    visibleRecordFieldsWidth +
    leftColumnsWidth +
    RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH * theme.scale +
    totalColumnsBorderWidth +
    resizeOffsetToAddOnlyIfItMakesTableContainerGrow;

  const tableContainerWidth = Math.max(
    recordTableWidth,
    emptyTableContainerComputedWidth,
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
    <StyledEmptyStateContainer width={tableContainerWidth}>
      <RecordTableStyleWrapper
        ref={tableBodyRef}
        style={columnWidthStyles}
        id={getRecordTableHtmlId(recordTableId)}
      >
        {/* An empty table has no cells to reveal, so the header would only add
            a horizontal scroll to a screen with nothing to scroll to. */}
        {!isMobile && <RecordTableHeader />}
      </RecordTableStyleWrapper>
      <RecordTableEmptyState />
      <RecordTableColumnWidthEffect />
      <RecordTableWidthEffect />
      <RecordTableVirtualizedDataChangedEffect />
    </StyledEmptyStateContainer>
  );
};
