import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { numberOfTableRowsState } from '../states/numberOfTableRowsState';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { useResetTableRowSelection } from './useResetTableRowSelection';

export function useInitializeEntityTable() {
  const resetTableRowSelection = useResetTableRowSelection();

  const tableRowIds = useRecoilValue(tableRowIdsState);

  useEffect(() => {
    resetTableRowSelection();
  }, [resetTableRowSelection]);

  const setNumberOfTableRows = useSetRecoilState(numberOfTableRowsState);

  useEffect(() => {
    setNumberOfTableRows(tableRowIds?.length);
  }, [tableRowIds, setNumberOfTableRows]);
}
