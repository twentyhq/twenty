import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { MOBILE_VIEWPORT } from 'twenty-ui';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { RecordTableHeaderCell } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCell';
import { RecordTableHeaderCheckboxColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderCheckboxColumn';
import { RecordTableHeaderDragDropColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderDragDropColumn';
import { RecordTableHeaderLastColumn } from '@/object-record/record-table/record-table-header/components/RecordTableHeaderLastColumn';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { isRecordTableScrolledTopComponentState } from '@/object-record/record-table/states/isRecordTableScrolledTopComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

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
    z-index: ${({ isScrolledTop, isScrolledLeft }) =>
      !isScrolledLeft && !isScrolledTop
        ? 2
        : !isScrolledLeft
          ? 0
          : !isScrolledTop
            ? 2
            : 0};
    position: sticky;
  }

  th:nth-of-type(1),
  th:nth-of-type(2),
  th:nth-of-type(3) {
    z-index: ${({ isScrolledTop, isScrolledLeft }) =>
      !isScrolledLeft && !isScrolledTop
        ? 7
        : !isScrolledLeft
          ? 3
          : !isScrolledTop
            ? 6
            : 0};

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

  const isRecordTableScrolledTop = useRecoilComponentValue(
    isRecordTableScrolledTopComponentState,
  );

  const isRecordTableScrolledLeft = useRecoilComponentValue(
    isRecordTableScrolledLeftComponentState,
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
        <RecordTableHeaderLastColumn />
      </tr>
    </StyledTableHead>
  );
};
