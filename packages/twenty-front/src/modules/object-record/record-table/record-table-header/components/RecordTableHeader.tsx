import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastColumn';

const StyledTableHead = styled.thead`
  cursor: pointer;

  th:nth-of-type(1) {
    width: 9px;
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
    }
    th:nth-of-type(2) {
      position: sticky;
      left: 9px;
      z-index: 5;
    }
    th:nth-of-type(3) {
      position: sticky;
      left: 39px;
      z-index: 5;
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
        width: 30px;
        max-width: 35px;
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

export const RecordTableHeader = ({
  objectMetadataNameSingular,
}: {
  objectMetadataNameSingular: string;
}) => {
  const { visibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  return (
    <StyledTableHead id="record-table-header" data-select-disable>
      <tr>
        <RecordTableHeaderDragDropColumn />
        <RecordTableHeaderCheckboxColumn />
        {visibleTableColumns.map((column) => (
          <RecordTableHeaderCell
            key={column.fieldMetadataId}
            column={column}
            objectMetadataNameSingular={objectMetadataNameSingular}
          />
        ))}
        <RecordTableHeaderLastColumn />
      </tr>
    </StyledTableHead>
  );
};
