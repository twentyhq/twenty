import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { ViewFieldContext } from '../contexts/ViewFieldContext';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { visibleTableColumnsState } from '../states/tableColumnsState';

import { CheckboxCell } from './CheckboxCell';
import { EntityTableCell } from './EntityTableCell';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.accent.quaternary : 'none'};
`;

export function EntityTableRow({ rowId }: { rowId: string }) {
  const columns = useRecoilValue(visibleTableColumnsState);
  const { currentRowSelected } = useCurrentRowSelected();

  return (
    <StyledRow
      data-testid={`row-id-${rowId}`}
      selected={currentRowSelected}
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
