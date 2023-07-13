import { useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { Row } from '@tanstack/table-core';
import { useRecoilState } from 'recoil';

import { TableColumn } from '@/people/table/components/peopleColumns';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { CellContext } from '@/ui/tables/states/CellContext';
import { currentRowEntityIdScopedState } from '@/ui/tables/states/currentRowEntityIdScopedState';
import { currentRowNumberScopedState } from '@/ui/tables/states/currentRowNumberScopedState';
import { RowContext } from '@/ui/tables/states/RowContext';
import { currentRowSelectionState } from '@/ui/tables/states/rowSelectionState';

import { CheckboxCell } from './CheckboxCellV2';
import { EntityTableCell } from './EntityTableCellV2';

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
  console.log('EntityTableRow');
  const [currentRowSelection] = useRecoilState(currentRowSelectionState);
  const [currentRowEntityId, setCurrentRowEntityId] = useRecoilScopedState(
    currentRowEntityIdScopedState,
    RowContext,
  );

  const [, setCurrentRowNumber] = useRecoilScopedState(
    currentRowNumberScopedState,
    RowContext,
  );

  useEffect(() => {
    console.log({ currentRowEntityId, rowId });
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
      selected={!!currentRowSelection[rowId]}
    >
      <CheckboxCell />
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
