import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN } from '../constants';
import { numberOfTableColumnsState } from '../states/numberOfTableColumnsState';
import { numberOfTableRowsState } from '../states/numberOfTableRowsState';

import { useResetTableRowSelection } from './useResetTableRowSelection';
import { useSetSoftFocusPosition } from './useSetSoftFocusPosition';

export type TableDimensions = {
  numberOfRows: number;
  numberOfColumns: number;
};

export function useInitializeEntityTable({
  numberOfRows,
  numberOfColumns,
}: TableDimensions) {
  const resetTableRowSelection = useResetTableRowSelection();

  useEffect(() => {
    resetTableRowSelection();
  }, [resetTableRowSelection]);

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

  const setSoftFocusPosition = useSetSoftFocusPosition();

  useEffect(() => {
    setSoftFocusPosition({
      row: 0,
      column: TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN,
    });
    // Disabled because a recoilCallback is not a dynamic dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
