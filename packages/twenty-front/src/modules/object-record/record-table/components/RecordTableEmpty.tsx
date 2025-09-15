import { RecordTableColumnWidthEffect } from '@/object-record/record-table/components/RecordTableColumnWidthEffect';
import { RecordTableStyleWrapper } from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { RecordTableWidthEffect } from '@/object-record/record-table/components/RecordTableWidthEffect';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_HTML_ID } from '@/object-record/record-table/constants/RecordTableHtmlId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { useRecordTableLastColumnWidthToFill } from '@/object-record/record-table/hooks/useRecordTableLastColumnWidthToFill';
import { RecordTableHeader } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { isDefined, sumByProperty } from 'twenty-shared/utils';

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

  const resizeOffsetToAddOnlyIfItMakesTableContainerGrow = isResizing
    ? resizeFieldOffset > 0
      ? resizeFieldOffset
      : 0
    : 0;

  const totalWidthOfRecordFieldColumns = visibleRecordFields.reduce(
    sumByProperty('size'),
    0,
  );

  const totalColumnsBorderWidth = visibleRecordFields.length;

  const { lastColumnWidth } = useRecordTableLastColumnWidthToFill();

  const emptyTableContainerComputedWidth =
    totalWidthOfRecordFieldColumns +
    RECORD_TABLE_COLUMN_CHECKBOX_WIDTH +
    RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
    RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH +
    totalColumnsBorderWidth +
    resizeOffsetToAddOnlyIfItMakesTableContainerGrow;

  const tableContainerWidth = Math.max(
    recordTableWidth,
    emptyTableContainerComputedWidth,
  );

  return (
    <StyledEmptyStateContainer width={tableContainerWidth}>
      <RecordTableStyleWrapper
        ref={tableBodyRef}
        visibleRecordFields={visibleRecordFields}
        lastColumnWidth={lastColumnWidth}
        id={RECORD_TABLE_HTML_ID}
      >
        <RecordTableHeader />
      </RecordTableStyleWrapper>
      <RecordTableEmptyState />
      <RecordTableColumnWidthEffect />
      <RecordTableWidthEffect />
    </StyledEmptyStateContainer>
  );
};
