import styled from '@emotion/styled';
import { useContext, useMemo } from 'react';

import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { RecordTableColumnFooterWithDropdown } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterWithDropdown';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

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
  const tableColumns = useRecoilComponentValueV2(tableColumnsComponentState);
  const tableColumnsByKey = useMemo(
    () =>
      mapArrayToObject(tableColumns, ({ fieldMetadataId }) => fieldMetadataId),
    [tableColumns],
  );
  const { fieldMetadataId } = useContext(
    RecordTableColumnAggregateFooterCellContext,
  );

  return (
    <StyledColumnFooterCell
      columnWidth={Math.max(
        tableColumnsByKey[fieldMetadataId].size + 24,
        COLUMN_MIN_WIDTH,
      )}
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
