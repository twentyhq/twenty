import styled from '@emotion/styled';
import { useContext } from 'react';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { RecordTableColumnFooterWithDropdown } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterWithDropdown';
import { findById, isDefined } from 'twenty-shared/utils';

const COLUMN_MIN_WIDTH = 104;

const StyledColumnFooterCell = styled.td<{
  columnWidth: number;
  isFirstCell?: boolean;
}>`
  background-color: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.tertiary};
  overflow: hidden;
  padding: 0;

  position: relative;
  ${({ columnWidth }) => `
      min-width: ${columnWidth}px;
      width: ${columnWidth}px;
      `}
  text-align: left;
  transition: 0.3s ease;
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
  height: 32px;

  user-select: none;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  *::-webkit-scrollbar {
    display: none;
  }
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

  const recordField = visibleRecordFields.find(findById(fieldMetadataId));

  if (!isDefined(recordField)) {
    return null;
  }

  return (
    <StyledColumnFooterCell
      columnWidth={Math.max(recordField.size + 24, COLUMN_MIN_WIDTH)}
      colSpan={isFirstCell ? 2 : undefined}
      isFirstCell={isFirstCell}
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
