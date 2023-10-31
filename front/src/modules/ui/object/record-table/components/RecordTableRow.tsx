import { forwardRef } from 'react';
import styled from '@emotion/styled';

import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { ColumnContext } from '../contexts/ColumnContext';
import { useCurrentRowSelected } from '../hooks/useCurrentRowSelected';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { visibleTableColumnsScopedSelector } from '../states/selectors/visibleTableColumnsScopedSelector';

import { CheckboxCell } from './CheckboxCell';
import { RecordTableCell } from './RecordTableCell';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.accent.quaternary : 'none'};
`;

type RecordTableRowProps = {
  rowId: string;
};

export const RecordTableRow = forwardRef<
  HTMLTableRowElement,
  RecordTableRowProps
>(({ rowId }, ref) => {
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
      {[...visibleTableColumns]
        .sort((columnA, columnB) => columnA.position - columnB.position)
        .map((column, columnIndex) => {
          return (
            <ColumnContext.Provider value={column} key={column.fieldId}>
              <RecordTableCell cellIndex={columnIndex} />
            </ColumnContext.Provider>
          );
        })}
      <td></td>
    </StyledRow>
  );
});
