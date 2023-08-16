import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { ViewFieldContext } from '../contexts/ViewFieldContext';
import { visibleTableColumnsState } from '../states/tableColumnsState';

import { CheckboxCell } from './CheckboxCell';
import { EntityTableCell } from './EntityTableCell';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.background.secondary : 'none'};
`;

export function EntityTableRow({ rowId }: { rowId: string }) {
  const columns = useRecoilValue(visibleTableColumnsState);

  return (
    <StyledRow
      data-testid={`row-id-${rowId}`}
      selected={false}
      data-selectable-id={rowId}
    >
      <td>
        <CheckboxCell />
      </td>
      {columns.map((column, columnIndex) => {
        return (
          <ViewFieldContext.Provider value={column} key={column.id}>
            <EntityTableCell cellIndex={columnIndex} />
          </ViewFieldContext.Provider>
        );
      })}
      <td></td>
    </StyledRow>
  );
}
