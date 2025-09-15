import styled from '@emotion/styled';
import { useContext } from 'react';

import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { RecordTableColumnFooterWithDropdown } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterWithDropdown';
import { findByProperty, isDefined } from 'twenty-shared/utils';

const StyledColumnFooterCell = styled.div<{
  columnWidth: number;
  isFirstCell: boolean;
  isTableWithGroups: boolean;
}>`
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.tertiary};

  padding: 0;

  ${({ columnWidth }) => `
      min-width: ${columnWidth}px;
      width: ${columnWidth}px;
      `}
  text-align: left;
  ${({ theme }) => {
    return `
    &:hover {
      background: ${theme.background.secondary};
    };
    &:active {
      background: ${theme.background.tertiary};
    };
    `;
  }};
  height: ${RECORD_TABLE_ROW_HEIGHT}px;

  user-select: none;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  *::-webkit-scrollbar {
    display: none;
  }

  position: sticky;
  bottom: 0;

  ${({ isFirstCell, isTableWithGroups }) =>
    isFirstCell
      ? `left: 48px; z-index: ${isTableWithGroups ? TABLE_Z_INDEX.footer.tableWithGroups.stickyColumn : TABLE_Z_INDEX.footer.tableWithoutGroups.stickyColumn};`
      : `z-index: ${isTableWithGroups ? TABLE_Z_INDEX.footer.tableWithGroups.default : TABLE_Z_INDEX.footer.tableWithoutGroups.default};`}
`;

const StyledColumnFootContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
`;

export const RecordTableAggregateFooterCell = ({
  isFirstCell = false,
  currentRecordGroupId,
}: {
  isFirstCell?: boolean;
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

  if (!isDefined(recordField)) {
    return null;
  }

  return (
    <StyledColumnFooterCell
      columnWidth={recordField.size + 1}
      isFirstCell={isFirstCell}
      className={'footer-cell'}
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
