import { useContext } from 'react';
import styled from '@emotion/styled';

import { RecordTableBody } from '@/object-record/record-table/components/RecordTableBody';
import { RecordTableBodyEffect } from '@/object-record/record-table/components/RecordTableBodyEffect';
import { RecordTableHeader } from '@/object-record/record-table/components/RecordTableHeader';
import { RecordTableRefContext } from '@/object-record/record-table/contexts/RecordTableRefContext';

const StyledTable = styled.table`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-spacing: 0;
  margin-right: ${({ theme }) => theme.table.horizontalCellMargin};
  table-layout: fixed;

  width: calc(100% - ${({ theme }) => theme.table.horizontalCellMargin} * 2);

  th {
    border-block: 1px solid ${({ theme }) => theme.border.color.light};
    color: ${({ theme }) => theme.font.color.tertiary};
    padding: 0;
    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-left-color: transparent;
      border-right-color: transparent;
    }
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
    color: ${({ theme }) => theme.font.color.primary};
    padding: 0;

    text-align: left;

    :last-child {
      border-right-color: transparent;
    }
    :first-of-type {
      border-left-color: transparent;
      border-right-color: transparent;
    }
  }

  th,
  td {
    background-color: ${({ theme }) => theme.background.primary};
    border-right: 1px solid ${({ theme }) => theme.border.color.light};
  }

  thead th:nth-of-type(-n + 2),
  tbody td:nth-of-type(-n + 2) {
    position: sticky;
    z-index: 2;
  }

  thead th:nth-of-type(1),
  tbody td:nth-of-type(1) {
    left: 0;
  }
  thead th:nth-of-type(2),
  tbody td:nth-of-type(2) {
    left: calc(${({ theme }) => theme.table.checkboxColumnWidth} - 1px);
  }

  &.freeze-first-columns-shadow thead th:nth-of-type(2),
  &.freeze-first-columns-shadow tbody td:nth-of-type(2) {
    box-shadow: ${({ theme }) => theme.boxShadow.strong};
    clip-path: inset(0px -14px 0px 0px);
  }

  &.freeze-first-columns-shadow thead th:nth-of-type(2)::before,
  &.freeze-first-columns-shadow tbody td:nth-of-type(2)::before {
    content: '';
    height: calc(100% + 1px);
    position: absolute;
    top: 0;
    width: 2px;
  }
`;

type RecordTableProps = {
  createRecord: () => void;
};

export const RecordTable = ({ createRecord }: RecordTableProps) => {
  const recordTableRef = useContext(RecordTableRefContext);

  return (
    <StyledTable ref={recordTableRef} className="entity-table-cell">
      <RecordTableHeader createRecord={createRecord} />
      <RecordTableBodyEffect />
      <RecordTableBody />
    </StyledTable>
  );
};
