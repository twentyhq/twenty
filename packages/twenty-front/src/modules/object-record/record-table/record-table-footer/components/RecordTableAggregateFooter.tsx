import styled from '@emotion/styled';

import { RecordTableAggregateFooterCell } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooterCell';
import { RecordTableColumnAggregateFooterCellContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterCellContext';
import { FIRST_TH_WIDTH } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { scrollWrapperInstanceComponentState } from '@/ui/utilities/scroll/states/scrollWrapperInstanceComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { MOBILE_VIEWPORT } from 'twenty-ui';

const StyledTd = styled.td`
  background-color: ${({ theme }) => theme.background.primary};
`;

const StyledTableRow = styled.tr<{
  endOfTableSticky?: boolean;
  hasHorizontalOverflow?: boolean;
}>`
  td {
    border-top: 1px solid ${({ theme }) => theme.border.color.light};
  }
  cursor: pointer;
  td:nth-of-type(1) {
    width: ${FIRST_TH_WIDTH};
    left: 0;
    border-right-color: ${({ theme }) => theme.background.primary};
    border-top: none;
  }
  td:nth-of-type(2) {
    border-right-color: ${({ theme }) => theme.background.primary};
  }
  &.first-columns-sticky {
    td:nth-of-type(2) {
      position: sticky;
      z-index: 5;
      transition: 0.3s ease;
      &::after {
        content: '';
        position: absolute;
        top: -1px;
        height: calc(100% + 2px);
        width: 4px;
        right: 0px;
        box-shadow: ${({ theme }) => theme.boxShadow.light};
        clip-path: inset(0px -4px 0px 0px);
      }
      @media (max-width: ${MOBILE_VIEWPORT}px) {
        width: 34px;
        max-width: 34px;
      }
    }
  }
  position: sticky;
  z-index: 5;
  background: ${({ theme }) => theme.background.primary};
  ${({ endOfTableSticky, hasHorizontalOverflow }) =>
    endOfTableSticky &&
    `
      bottom: ${hasHorizontalOverflow ? '10px' : '0'};
      ${
        hasHorizontalOverflow &&
        `
        &::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          right: 0;
          height: 10px;
          background: inherit;
        }
      `
      }
    `}
`;

export const RecordTableAggregateFooter = ({
  currentRecordGroupId,
  endOfTableSticky,
}: {
  currentRecordGroupId?: string;

  endOfTableSticky?: boolean;
}) => {
  const visibleTableColumns = useRecoilComponentValueV2(
    visibleTableColumnsComponentSelector,
  );

  const overlayScrollbarsInstance = useRecoilComponentValueV2(
    scrollWrapperInstanceComponentState,
  );

  const hasHorizontalOverflow = overlayScrollbarsInstance
    ? overlayScrollbarsInstance.elements().scrollOffsetElement.scrollWidth >
      overlayScrollbarsInstance.elements().scrollOffsetElement.clientWidth
    : false;

  return (
    <StyledTableRow
      id={`record-table-footer${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`}
      data-select-disable
      endOfTableSticky={endOfTableSticky}
      hasHorizontalOverflow={hasHorizontalOverflow}
    >
      <StyledTd />
      {visibleTableColumns.map((column, index) => {
        return (
          <RecordTableColumnAggregateFooterCellContext.Provider
            key={`${column.fieldMetadataId}${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`}
            value={{
              viewFieldId: column.viewFieldId || '',
              fieldMetadataId: column.fieldMetadataId,
            }}
          >
            <RecordTableAggregateFooterCell
              currentRecordGroupId={currentRecordGroupId}
              isFirstCell={index === 0}
            />
          </RecordTableColumnAggregateFooterCellContext.Provider>
        );
      })}
      <td colSpan={visibleTableColumns.length - 1} />
      <td />
      <td />
    </StyledTableRow>
  );
};
