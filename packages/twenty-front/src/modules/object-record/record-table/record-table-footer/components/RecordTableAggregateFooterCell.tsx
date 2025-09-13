import styled from '@emotion/styled';
import { useContext } from 'react';

import { TABLE_Z_INDEX } from '@/object-record/record-table/constants/TableZIndex';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { RecordTableColumnFooterWithDropdown } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterWithDropdown';
import { findByProperty, isDefined } from 'twenty-shared/utils';

const StyledColumnFooterCell = styled.div<{
  columnWidth: number;
  isFirstCell?: boolean;
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
  height: 32px;

  position: sticky;
  left: 48px;
  bottom: 0;
  z-index: ${TABLE_Z_INDEX.footer.stickyColumn};

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

  const recordField = visibleRecordFields.find(
    findByProperty('fieldMetadataItemId', fieldMetadataId),
  );

  if (!isDefined(recordField)) {
    return null;
  }

  return (
    <StyledColumnFooterCell
      columnWidth={recordField.size + 1}
      // TODO: fix colspan
      // colSpan={isFirstCell ? 2 : undefined}
      isFirstCell={isFirstCell}
      className={isFirstCell ? '' : 'footer-cell'}
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
