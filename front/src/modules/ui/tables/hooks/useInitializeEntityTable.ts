import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN } from '../constants';
import { entityTableDimensionsState } from '../states/entityTableDimensionsState';

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

  const [, setTableDimensions] = useRecoilState(entityTableDimensionsState);

  useEffect(() => {
    setTableDimensions({
      numberOfColumns,
      numberOfRows,
    });
  }, [numberOfRows, numberOfColumns, setTableDimensions]);

  const setSoftFocusPosition = useSetSoftFocusPosition();

  useEffect(() => {
    setSoftFocusPosition({
      row: 0,
      column: TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN,
    });
  }, [setSoftFocusPosition]);
}
