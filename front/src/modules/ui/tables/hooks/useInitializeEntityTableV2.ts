import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { entityTableDimensionsState } from '../states/entityTableDimensionsState';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { useResetTableRowSelection } from './useResetTableRowSelection';

export type TableDimensions = {
  numberOfColumns: number;
  numberOfRows: number;
};

export function useInitializeEntityTable({
  numberOfColumns,
}: {
  numberOfColumns: number;
}) {
  const resetTableRowSelection = useResetTableRowSelection();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  useEffect(() => {
    resetTableRowSelection();
  }, [resetTableRowSelection]);

  const [, setTableDimensions] = useRecoilState(entityTableDimensionsState);

  useEffect(() => {
    console.log({ numberOfColumns, tableRowIds });
    setTableDimensions({
      numberOfColumns,
      numberOfRows: tableRowIds?.length,
    });
  }, [tableRowIds, numberOfColumns, setTableDimensions]);
}
