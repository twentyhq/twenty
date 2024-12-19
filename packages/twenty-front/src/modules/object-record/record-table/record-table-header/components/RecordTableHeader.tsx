import styled from '@emotion/styled';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastColumn';

export const FIRST_TH_WIDTH = '9px';

const StyledTableHead = styled.thead`
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

  &.header-sticky {
    th {
      position: sticky;
      top: 0;
      z-index: 5;
    }
  }

  &.header-sticky.first-columns-sticky {
    th:nth-of-type(1),
    th:nth-of-type(2),
    th:nth-of-type(3) {
      z-index: 10;
    }
  }
`;

export const RecordTableHeader = () => {
  const { visibleTableColumns } = useRecordTableContextOrThrow();

  return (
    <StyledTableHead id="record-table-header" data-select-disable>
      <tr>
        <RecordTableHeaderDragDropColumn />
        <RecordTableHeaderCheckboxColumn />
        {visibleTableColumns.map((column) => (
          <RecordTableHeaderCell key={column.fieldMetadataId} column={column} />
        ))}
        <RecordTableHeaderLastColumn />
      </tr>
    </StyledTableHead>
  );
};
