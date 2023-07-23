import { useEffect, useState } from 'react';
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
  // const [isInitializing, setIsInitializing] = useState(true);

  // const [currentRowEntityId, setCurrentRowEntityId] = useRecoilScopedState(
  //   currentRowEntityIdScopedState,
  //   RowContext,
  // );

  // const isCurrentRowSelected = useRecoilValue(isRowSelectedFamilyState(rowId));

  // const [, setCurrentRowNumber] = useRecoilScopedState(
  //   currentRowNumberScopedState,
  //   RowContext,
  // );

  // useEffect(() => {
  //   if (currentRowEntityId !== rowId) {
  //     setCurrentRowEntityId(rowId);
  //   }
  // }, [rowId, setCurrentRowEntityId, currentRowEntityId]);

  // useEffect(() => {
  //   setCurrentRowNumber(index);
  // }, [index, setCurrentRowNumber]);

  // const isInitializing = currentRowEntityId !== rowId;

  // useEffect(() => {
  //   if (currentRowEntityId !== rowId) {
  //     setCurrentRowEntityId(rowId);
  //   }

  //   setCurrentRowNumber(index);

  //   setIsInitializing(false);
  // }, [
  //   index,
  //   rowId,
  //   currentRowEntityId,
  //   setCurrentRowEntityId,
  //   setCurrentRowNumber,
  // ]);

  console.log('EntityTableRow');

  // if (isInitializing) {
  //   return null;
  // }

  return (
    <StyledRow key={rowId} data-testid={`row-id-${rowId}`} selected={false}>
      <td>
        <CheckboxCell />
      </td>
      {columns.map((column, columnIndex) => {
        return (
          <RecoilScope SpecificContext={CellContext} key={column.id.toString()}>
            <RecoilScope>
              <EntityTableCell
                size={column.size}
                cellIndex={columnIndex}
                rowId={rowId}
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
