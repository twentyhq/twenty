import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { RecordTableColumnWidthEffect } from '@/object-record/record-table/components/RecordTableColumnWidthEffect';
import { RecordTableStyleWrapper } from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { RecordTableWidthEffect } from '@/object-record/record-table/components/RecordTableWidthEffect';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_HTML_ID } from '@/object-record/record-table/constants/RecordTableHtmlId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { shouldCompactRecordTableFirstColumnComponentState } from '@/object-record/record-table/states/shouldCompactRecordTableFirstColumnComponentState';
import { computeVisibleRecordFieldsWidthOnTable } from '@/object-record/record-table/utils/computeVisibleRecordFieldsWidthOnTable';
import { RecordTableVirtualizedDataChangedEffect } from '@/object-record/record-table/virtualization/components/RecordTableVirtualizedDataChangedEffect';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';

const StyledEmptyStateContainer = styled.div<{ width: number }>`
  height: 100%;
  overflow: hidden;
  width: ${({ width }) => width}px;
`;

export interface RecordTableEmptyProps {
  tableBodyRef: React.RefObject<HTMLDivElement>;
}

export const RecordTableEmpty = ({ tableBodyRef }: RecordTableEmptyProps) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const recordTableWidth = useRecoilComponentValue(
    recordTableWidthComponentState,
  );

  const resizedFieldMetadataId = useRecoilComponentValue(
    resizedFieldMetadataIdComponentState,
  );

  const resizeFieldOffset = useRecoilComponentValue(
    resizeFieldOffsetComponentState,
  );

  const isResizing = isDefined(resizedFieldMetadataId);

  const shouldCompactRecordTableFirstColumn = useRecoilComponentValue(
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
  });

  const emptyTableContainerComputedWidth =
    visibleRecordFieldsWidth +
    RECORD_TABLE_COLUMN_CHECKBOX_WIDTH +
    RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
    RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH +
    totalColumnsBorderWidth +
    resizeOffsetToAddOnlyIfItMakesTableContainerGrow;

  const tableContainerWidth = Math.max(
    recordTableWidth,
    emptyTableContainerComputedWidth,
  );

  const hasRecordGroups = useRecoilComponentValue(
    hasRecordGroupsComponentSelector,
  );

  return (
    <StyledEmptyStateContainer width={tableContainerWidth}>
      <RecordTableStyleWrapper
        ref={tableBodyRef}
        visibleRecordFields={visibleRecordFields}
        id={RECORD_TABLE_HTML_ID}
        hasRecordGroups={hasRecordGroups}
      >
        <RecordTableHeader />
      </RecordTableStyleWrapper>
      <RecordTableEmptyState />
      <RecordTableColumnWidthEffect />
      <RecordTableWidthEffect />
      <RecordTableVirtualizedDataChangedEffect />
    </StyledEmptyStateContainer>
  );
};
