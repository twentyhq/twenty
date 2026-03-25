import { styled } from '@linaria/react';

import {
  RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR,
  RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR,
} from '@/object-record/record-table/components/RecordTableStyleWrapper';
import { RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnAddColumnButtonWidth';
import { RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME } from '@/object-record/record-table/constants/RecordTableColumnLastEmptyColumnWidthClassName';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableAggregateFooterCell } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooterCell';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledPlaceholderDragAndDropFooterCell = styled.div`
  background-color: ${themeCssVariables.background.primary};
  bottom: 0;
  left: 0px;
  position: sticky;
  width: calc(
    var(${RECORD_TABLE_DRAG_DROP_WIDTH_CSS_VAR}) +
      var(${RECORD_TABLE_CHECKBOX_WIDTH_CSS_VAR})
  );

  z-index: ${TABLE_Z_INDEX.footer.stickyColumn};
`;

const StyledPlaceholderAddButtonPlaceholderFooterCell = styled.div`
  background-color: ${themeCssVariables.background.primary};
  bottom: 0;
  position: sticky;
  width: ${RECORD_TABLE_COLUMN_ADD_COLUMN_BUTTON_WIDTH}px;
  z-index: ${TABLE_Z_INDEX.footer.default};
`;

const StyledPlaceholderLastColumnEmptyFooterCell = styled.div`
  background-color: ${themeCssVariables.background.primary};
  bottom: 0;
  position: sticky;
  z-index: ${TABLE_Z_INDEX.footer.default};
`;

const StyledAggregateFooterContainer = styled.div`
  bottom: 0;
  display: flex;
  position: sticky;
  z-index: ${TABLE_Z_INDEX.footer.default};
`;

export const RecordTableAggregateFooter = ({
  currentRecordGroupId,
}: {
  currentRecordGroupId?: string;
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  return (
    <StyledAggregateFooterContainer>
      <StyledPlaceholderDragAndDropFooterCell />
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
      <StyledPlaceholderAddButtonPlaceholderFooterCell />
      <StyledPlaceholderLastColumnEmptyFooterCell
        className={RECORD_TABLE_COLUMN_LAST_EMPTY_COLUMN_WIDTH_CLASS_NAME}
      />
    </StyledAggregateFooterContainer>
  );
};
