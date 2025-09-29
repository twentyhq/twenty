import styled from '@emotion/styled';

import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableAggregateFooterCell } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooterCell';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { isDefined } from 'twenty-shared/utils';

const StyledPlaceholderDragAndDropFooterCell = styled.div<{
  isTableWithGroups: boolean;
}>`
  background-color: ${({ theme }) => theme.background.primary};
  width: ${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH +
  RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px;
  position: sticky;
  left: 0px;
  bottom: 0;

  z-index: ${({ isTableWithGroups }) =>
    isTableWithGroups
      ? TABLE_Z_INDEX.footer.tableWithGroups.stickyColumn
      : TABLE_Z_INDEX.footer.tableWithoutGroups.stickyColumn};
`;

const StyledPlaceholderAddButtonPlaceholderFooterCell = styled.div<{
  isTableWithGroups: boolean;
}>`
  background-color: ${({ theme }) => theme.background.primary};
  width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;
  position: sticky;
  bottom: 0;
  z-index: ${({ isTableWithGroups }) =>
    isTableWithGroups
      ? TABLE_Z_INDEX.footer.tableWithGroups.default
      : TABLE_Z_INDEX.footer.tableWithoutGroups.default};
`;

const StyledPlaceholderLastColumnEmptyFooterCell = styled.div<{
  isTableWithGroups: boolean;
}>`
  background-color: ${({ theme }) => theme.background.primary};
  position: sticky;
  bottom: 0;
  z-index: ${({ isTableWithGroups }) =>
    isTableWithGroups
      ? TABLE_Z_INDEX.footer.tableWithGroups.default
      : TABLE_Z_INDEX.footer.tableWithoutGroups.default};
`;

export const RecordTableAggregateFooter = ({
  currentRecordGroupId,
}: {
  currentRecordGroupId?: string;
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const isTableWithGroups = isDefined(currentRecordGroupId);

  return (
    <>
      <StyledPlaceholderDragAndDropFooterCell
        isTableWithGroups={isTableWithGroups}
      />
      {visibleRecordFields.map((recordField, index) => {
        return (
          <RecordTableColumnAggregateFooterCellContext.Provider
            key={`${recordField.fieldMetadataItemId}${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`}
            value={{
              viewFieldId: recordField.id || '',
              fieldMetadataId: recordField.fieldMetadataItemId,
            }}
          >
            <RecordTableAggregateFooterCell
              currentRecordGroupId={currentRecordGroupId}
              columnIndex={index}
            />
          </RecordTableColumnAggregateFooterCellContext.Provider>
        );
      })}
      <StyledPlaceholderAddButtonPlaceholderFooterCell
        isTableWithGroups={isTableWithGroups}
      />
      <StyledPlaceholderLastColumnEmptyFooterCell
        isTableWithGroups={isTableWithGroups}
        className={RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME}
      />
    </>
  );
};
