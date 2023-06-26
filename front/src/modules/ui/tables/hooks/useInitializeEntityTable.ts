import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { numberOfTableColumnsState } from '../states/numberOfTableColumnsState';
import { numberOfTableRowsState } from '../states/numberOfTableRowsState';
import { softFocusPositionState } from '../states/softFocusPositionState';

import { useResetTableRowSelection } from './useResetTableRowSelection';

export type TableDimensions = {
  numberOfRows: number;
  numberOfColumns: number;
};

export function useInitializeEntityTable({
  numberOfRows,
  numberOfColumns,
}: TableDimensions) {
  const resetTableRowSelection = useResetTableRowSelection();

  React.useEffect(() => {
    resetTableRowSelection();
  }, [resetTableRowSelection]);

  const [, setSoftFocusPosition] = useRecoilState(softFocusPositionState);

  React.useEffect(() => {
    setSoftFocusPosition({
      row: 0,
      column: 1,
    });
  }, [setSoftFocusPosition]);

  const [, setNumberOfTableColumns] = useRecoilState(numberOfTableColumnsState);
  const [, setNumberOfTableRows] = useRecoilState(numberOfTableRowsState);

  useEffect(() => {
    setNumberOfTableColumns(numberOfColumns);
    setNumberOfTableRows(numberOfRows);
  }, [
    numberOfRows,
    numberOfColumns,
    setNumberOfTableColumns,
    setNumberOfTableRows,
  ]);
}
