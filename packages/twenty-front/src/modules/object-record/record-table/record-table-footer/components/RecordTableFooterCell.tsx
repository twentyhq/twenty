import styled from '@emotion/styled';
import { useMemo } from 'react';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordTableColumnFooterWithDropdown } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnFooterWithDropdown';
import { tableColumnsComponentState } from '@/object-record/record-table/states/tableColumnsComponentState';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

const COLUMN_MIN_WIDTH = 104;

const StyledColumnFooterCell = styled.th<{
  columnWidth: number;
  isResizing?: boolean;
}>`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: 0;
  text-align: left;
  transition: 0.3s ease;

  background-color: ${({ theme }) => theme.background.primary};
  ${({ columnWidth }) => `
      min-width: ${columnWidth}px;
      width: ${columnWidth}px;
      `}
  position: relative;
  user-select: none;
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
  ${({ isResizing, theme }) => {
    if (isResizing === true) {
      return `&:after {
        background-color: ${theme.color.blue};
        bottom: 0;
        content: '';
        display: block;
        position: absolute;
        right: -1px;
        top: 0;
        width: 2px;
      }`;
    }
  }};

  // TODO: refactor this, each component should own its CSS
  overflow: auto;
`;

const StyledColumnFootContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
`;

export const RecordTableFooterCell = ({
  column,
}: {
  column: ColumnDefinition<FieldMetadata>;
}) => {
  const tableColumns = useRecoilComponentValueV2(tableColumnsComponentState);
  const tableColumnsByKey = useMemo(
    () =>
      mapArrayToObject(tableColumns, ({ fieldMetadataId }) => fieldMetadataId),
    [tableColumns],
  );

  return (
    <StyledColumnFooterCell
      key={column.fieldMetadataId}
      columnWidth={Math.max(
        tableColumnsByKey[column.fieldMetadataId].size + 24,
        COLUMN_MIN_WIDTH,
      )}
    >
      <StyledColumnFootContainer>
        <RecordTableColumnFooterWithDropdown column={column} />
      </StyledColumnFootContainer>
    </StyledColumnFooterCell>
  );
};
