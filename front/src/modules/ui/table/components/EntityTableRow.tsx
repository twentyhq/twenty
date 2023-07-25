import styled from '@emotion/styled';

import { TableColumn } from '@/people/table/components/peopleColumns';

import { CheckboxCell } from './CheckboxCell';
import { EntityTableCell } from './EntityTableCell';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.background.secondary : 'none'};
`;

export function EntityTableRow({
  columns,
  rowId,
}: {
  columns: TableColumn[];
  rowId: string;
}) {
  return (
    <StyledRow data-testid={`row-id-${rowId}`} selected={false}>
      <td>
        <CheckboxCell />
      </td>
      {columns.map((column, columnIndex) => {
        return (
          <EntityTableCell
            key={column.id}
            size={column.size}
            cellIndex={columnIndex}
          >
            {column.cellComponent}
          </EntityTableCell>
        );
      })}
      <td></td>
    </StyledRow>
  );
}
