import { forwardRef } from 'react';
import styled from '@emotion/styled';

import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { ColumnContext } from '../contexts/ColumnContext';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { visibleTableColumnsScopedSelector } from '../states/selectors/visibleTableColumnsScopedSelector';

import { CheckboxCell } from './CheckboxCell';
import { EntityTableCell } from './EntityTableCell';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.accent.quaternary : 'none'};
`;

type EntityTableRowProps = {
  rowId: string;
};

export const EntityTableRow = forwardRef<
  HTMLTableRowElement,
  EntityTableRowProps
>(function EntityTableRow({ rowId }, ref) {
  const visibleTableColumns = useRecoilScopedValue(
    visibleTableColumnsScopedSelector,
    TableRecoilScopeContext,
  );
  const { currentRowSelected } = useCurrentRowSelected();

  return (
    <StyledRow
      ref={ref}
      data-testid={`row-id-${rowId}`}
      selected={currentRowSelected}
      data-selectable-id={rowId}
    >
      <td>
        <CheckboxCell />
      </td>
      {visibleTableColumns.map((column, columnIndex) => {
        return (
          <ColumnContext.Provider value={column} key={column.key}>
            <EntityTableCell cellIndex={columnIndex} />
          </ColumnContext.Provider>
        );
      })}
      <td></td>
    </StyledRow>
  );
});
