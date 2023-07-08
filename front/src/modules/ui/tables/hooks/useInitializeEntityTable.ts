import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { entityTableDimensionsState } from '../states/entityTableDimensionsState';

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
}
