import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { TableColumn } from '@/people/table/components/peopleColumns';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/ui/recoil-scope/hooks/useRecoilScopedState';

import { CellContext } from '../states/CellContext';
import { currentRowEntityIdScopedState } from '../states/currentRowEntityIdScopedState';
import { currentRowNumberScopedState } from '../states/currentRowNumberScopedState';
import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';
import { RowContext } from '../states/RowContext';

import { CheckboxCell } from './CheckboxCell';
import { EntityTableCell } from './EntityTableCell';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.background.secondary : 'none'};
`;

export function EntityTableRow({
  columns,
  rowId,
  index,
}: {
  columns: TableColumn[];
  rowId: string;
  index: number;
}) {
  const [currentRowEntityId, setCurrentRowEntityId] = useRecoilScopedState(
    currentRowEntityIdScopedState,
    RowContext,
  );

  const isCurrentRowSelected = useRecoilValue(isRowSelectedFamilyState(rowId));

  const [, setCurrentRowNumber] = useRecoilScopedState(
    currentRowNumberScopedState,
    RowContext,
  );

  useEffect(() => {
    if (currentRowEntityId !== rowId) {
      setCurrentRowEntityId(rowId);
    }
  }, [rowId, setCurrentRowEntityId, currentRowEntityId]);

  useEffect(() => {
    setCurrentRowNumber(index);
  }, [index, setCurrentRowNumber]);

  return (
    <StyledRow
      key={rowId}
      data-testid={`row-id-${rowId}`}
      selected={isCurrentRowSelected}
    >
      <td>
        <CheckboxCell />
      </td>
      {columns.map((column, columnIndex) => {
        return (
          <RecoilScope SpecificContext={CellContext} key={column.id.toString()}>
            <RecoilScope>
              <EntityTableCell
                rowId={rowId}
                size={column.size}
                cellIndex={columnIndex}
              >
                {column.cellComponent}
              </EntityTableCell>
            </RecoilScope>
          </RecoilScope>
        );
      })}
      <td></td>
    </StyledRow>
  );
}
