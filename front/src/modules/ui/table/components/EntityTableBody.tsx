import { useRecoilValue } from 'recoil';

import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';

import { isFetchingEntityTableDataState } from '../states/isFetchingEntityTableDataState';
import { RowIdContext } from '../states/RowIdContext';
import { RowIndexContext } from '../states/RowIndexContext';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { EntityTableRow } from './EntityTableRow';

export function EntityTableBody() {
  const rowIds = useRecoilValue(tableRowIdsState);

  const isNavbarSwitchingSize = useRecoilValue(isNavbarSwitchingSizeState);

  const isFetchingEntityTableData = useRecoilValue(
    isFetchingEntityTableDataState,
  );

  if (isFetchingEntityTableData || isNavbarSwitchingSize) {
    return null;
  }

  return (
    <tbody>
      {rowIds.map((rowId, index) => (
        <RowIdContext.Provider value={rowId} key={rowId}>
          <RowIndexContext.Provider value={index}>
            <EntityTableRow rowId={rowId} />
          </RowIndexContext.Provider>
        </RowIdContext.Provider>
      ))}
    </tbody>
  );
}
