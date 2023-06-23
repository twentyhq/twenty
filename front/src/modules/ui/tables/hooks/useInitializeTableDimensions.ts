import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { numberOfTableColumnsState } from '../states/numberOfTableColumnsState';
import { numberOfTableRowsState } from '../states/numberOfTableRowsState';

export type TableDimensions = {
  numberOfRows: number;
  numberOfColumns: number;
};

export function useInitializeTableDimensions({
  numberOfRows,
  numberOfColumns,
}: TableDimensions) {
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
