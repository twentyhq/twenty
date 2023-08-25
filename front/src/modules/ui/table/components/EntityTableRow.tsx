import styled from '@emotion/styled';

import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { ViewFieldContext } from '../contexts/ViewFieldContext';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { visibleTableColumnsScopedSelector } from '../states/selectors/visibleTableColumnsScopedSelector';

import { CheckboxCell } from './CheckboxCell';
import { EntityTableCell } from './EntityTableCell';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.accent.quaternary : 'none'};
`;

export function EntityTableRow({ rowId }: { rowId: string }) {
  const columns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
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
