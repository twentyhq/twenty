import { useEffect } from 'react';
import styled from '@emotion/styled';
import { Row } from '@tanstack/table-core';
import { useRecoilState } from 'recoil';

import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { CellContext } from '@/ui/tables/states/CellContext';
import { currentRowNumberScopedState } from '@/ui/tables/states/currentRowNumberScopedState';
import { RowContext } from '@/ui/tables/states/RowContext';
import { currentRowSelectionState } from '@/ui/tables/states/rowSelectionState';

import { EntityTableCell } from './EntityTableCell';

const StyledRow = styled.tr<{ selected: boolean }>`
  background: ${(props) =>
    props.selected ? props.theme.background.secondary : 'none'};
`;

export function EntityTableRow<TData extends { id: string }>({
  row,
  index,
}: {
  row: Row<TData>;
  index: number;
}) {
  const [currentRowSelection] = useRecoilState(currentRowSelectionState);

  const [, setCurrentRowNumber] = useRecoilScopedState(
    currentRowNumberScopedState,
    RowContext,
  );

  useEffect(() => {
    setCurrentRowNumber(index);
  }, [index, setCurrentRowNumber]);

  return (
    <StyledRow
      key={row.id}
      data-testid={`row-id-${row.index}`}
      selected={!!currentRowSelection[row.id]}
    >
      {row.getVisibleCells().map((cell, cellIndex) => {
        return (
          <RecoilScope
            SpecificContext={CellContext}
            key={cell.id + row.original.id}
          >
            <RecoilScope>
              <EntityTableCell<TData>
                row={row}
                cell={cell}
                cellIndex={cellIndex}
              />
            </RecoilScope>
          </RecoilScope>
        );
      })}
      <td></td>
    </StyledRow>
  );
}
