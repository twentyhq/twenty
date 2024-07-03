import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { RecordTableHeaderCell } from '@/object-record/record-table/components/RecordTableHeaderCell';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/components/RecordTableHeaderDragDropColumn';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { isRecordTableScrolledLeftState } from '@/object-record/record-table/states/isRecordTableScrolledLeftState';
import { isRecordTableScrolledTopState } from '@/object-record/record-table/states/isRecordTableScrolledTopState';

const StyledTableHead = styled.thead<{
  isScrolledTop?: boolean;
  isScrolledLeft?: boolean;
}>`
  cursor: pointer;

  th {
    border-block: 1px solid ${({ theme }) => theme.border.color.light};
    color: ${({ theme }) => theme.font.color.tertiary};
    padding: 0;
    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-top-color: transparent;
      border-bottom-color: transparent;
    }
  }

  th {
    background-color: ${({ theme }) => theme.background.primary};
    border-right: 1px solid ${({ theme }) => theme.border.color.light};
    top: 0;
    z-index: ${({ isScrolledTop }) => (isScrolledTop ? 0 : 10)};
    position: sticky;
  }

  th:nth-of-type(1),
  th:nth-of-type(2),
  th:nth-of-type(3) {
    z-index: 12;
    background-color: ${({ theme }) => theme.background.primary};
  }

  th:nth-of-type(1) {
    width: 9px;
    left: 0;
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  th:nth-of-type(2) {
    left: 9px;
    border-right-color: ${({ theme }) => theme.background.primary};
  }

  th:nth-of-type(3) {
    left: 39px;

    ${({ isScrolledLeft }) =>
      !isScrolledLeft
        ? `@media (max-width: ${MOBILE_VIEWPORT}px) {
      width: 35px;
      max-width: 35px;
    }`
        : ''}
  }
`;

export const RecordTableHeader = ({
  createRecord,
}: {
  createRecord: () => void;
}) => {
  const { visibleTableColumnsSelector } = useRecordTableStates();

  const visibleTableColumns = useRecoilValue(visibleTableColumnsSelector());

  const isRecordTableScrolledTop = useRecoilValue(
    isRecordTableScrolledTopState,
  );

  const isRecordTableScrolledLeft = useRecoilValue(
    isRecordTableScrolledLeftState,
  );

  return (
    <StyledTableHead
      data-select-disable
      isScrolledTop={isRecordTableScrolledTop}
      isScrolledLeft={isRecordTableScrolledLeft}
    >
      <tr>
        <RecordTableHeaderDragDropColumn />
        <RecordTableHeaderCheckboxColumn />
        {visibleTableColumns.map((column) => (
          <RecordTableHeaderCell
            key={column.fieldMetadataId}
            column={column}
            createRecord={createRecord}
          />
        ))}
      </tr>
    </StyledTableHead>
  );
};
