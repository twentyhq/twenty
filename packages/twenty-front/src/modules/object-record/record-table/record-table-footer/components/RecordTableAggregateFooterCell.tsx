import { styled } from '@linaria/react';
import { useContext } from 'react';
import { themeCssVariables, MOBILE_VIEWPORT } from 'twenty-ui/theme-constants';

import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthOnMobile';
import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { RecordTableColumnFooterWithDropdown } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterWithDropdown';
import { getRecordTableColumnFieldWidthClassName } from '@/object-record/record-table/utils/getRecordTableColumnFieldWidthClassName';
import { cx } from '@linaria/core';
import { findByProperty, isDefined } from 'twenty-shared/utils';

const StyledColumnFooterCell = styled.div<{
  columnWidth: number;
  isFirstCell: boolean;
  isTableWithGroups: boolean;
}>`
  background-color: ${themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.tertiary};

  border-right: solid 1px ${themeCssVariables.background.primary};

  padding: 0;

  min-width: ${({ columnWidth }) => columnWidth}px;
  width: ${({ columnWidth }) => columnWidth}px;
  text-align: left;
  &:hover {
    background: ${themeCssVariables.background.secondary};
  }
  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  overflow: hidden;

  position: sticky;
  bottom: 0;

  left: ${({ isFirstCell }) =>
    isFirstCell
      ? `${RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH + RECORD_TABLE_COLUMN_CHECKBOX_WIDTH}px`
      : 'auto'};
  z-index: ${({ isFirstCell, isTableWithGroups }) =>
    isFirstCell
      ? isTableWithGroups
        ? TABLE_Z_INDEX.footer.tableWithGroups.stickyColumn
        : TABLE_Z_INDEX.footer.tableWithoutGroups.stickyColumn
      : isTableWithGroups
        ? TABLE_Z_INDEX.footer.tableWithGroups.default
        : TABLE_Z_INDEX.footer.tableWithoutGroups.default};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: ${({ isFirstCell }) =>
      isFirstCell
        ? `${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px`
        : 'none'};
    min-width: ${({ isFirstCell }) =>
      isFirstCell
        ? `${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px`
        : '0'};
    width: ${({ isFirstCell }) =>
      isFirstCell
        ? `${RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_ON_MOBILE}px`
        : 'auto'};
  }
`;

const StyledColumnFootContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
`;

export const RecordTableAggregateFooterCell = ({
  columnIndex,
  currentRecordGroupId,
}: {
  columnIndex: number;
  currentRecordGroupId?: string;
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const { fieldMetadataId } = useContext(
    RecordTableColumnAggregateFooterCellContext,
  );

  const recordField = visibleRecordFields.find(
    findByProperty('fieldMetadataItemId', fieldMetadataId),
  );

  const isTableWithGroups = isDefined(currentRecordGroupId);

  const isFirstCell = columnIndex === 0;

  if (!isDefined(recordField)) {
    return null;
  }

  return (
    <StyledColumnFooterCell
      columnWidth={recordField.size + 1}
      isFirstCell={isFirstCell}
      className={cx(
        'footer-cell',
        getRecordTableColumnFieldWidthClassName(columnIndex),
      )}
      isTableWithGroups={isTableWithGroups}
    >
      <StyledColumnFootContainer>
        <RecordTableColumnFooterWithDropdown
          currentRecordGroupId={currentRecordGroupId}
          isFirstCell={isFirstCell}
        />
      </StyledColumnFootContainer>
    </StyledColumnFooterCell>
  );
};
