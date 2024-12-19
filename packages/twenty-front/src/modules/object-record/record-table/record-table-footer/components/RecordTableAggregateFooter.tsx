import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { RecordTableAggregateFooterCell } from '@/object-record/record-table/record-table-footer/components/RecordTableAggregateFooterCell';
import { FIRST_TH_WIDTH } from '@/object-record/record-table/record-table-header/components/RecordTableHeader';
import { visibleTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/visibleTableColumnsComponentSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

const StyledTableFoot = styled.thead<{ endOfTableSticky?: boolean }>`
  cursor: pointer;

  th:nth-of-type(1) {
    width: ${FIRST_TH_WIDTH};
    left: 0;
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  th:nth-of-type(2) {
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  &.first-columns-sticky {
    th:nth-of-type(1) {
      position: sticky;
      left: 0;
      z-index: 5;
      transition: 0.3s ease;
    }

    th:nth-of-type(2) {
      position: sticky;
      left: 11px;
      z-index: 5;
      transition: 0.3s ease;
    }

    th:nth-of-type(3) {
      position: sticky;
      left: 43px;
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

  tr {
    position: sticky;
    z-index: 5;
    ${({ endOfTableSticky }) => endOfTableSticky && `bottom: 0;`}
  }
`;

const StyledTh = styled.th`
  background-color: ${({ theme }) => theme.background.primary};
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

  return (
    <StyledTableFoot
      id={`record-table-footer${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`}
      data-select-disable
      endOfTableSticky={endOfTableSticky}
    >
      <tr>
        <StyledTh />
        <StyledTh />
        {visibleTableColumns.map((column, index) => (
          <RecordTableAggregateFooterCell
            key={`${column.fieldMetadataId}${currentRecordGroupId ? '-' + currentRecordGroupId : ''}`}
            column={column}
            currentRecordGroupId={currentRecordGroupId}
            isFirstCell={index === 0}
          />
        ))}
      </tr>
    </StyledTableFoot>
  );
};
