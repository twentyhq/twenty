import { useRecoilValue } from 'recoil';

import { TableColumn } from '@/people/table/components/peopleColumns';
import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';

import { isFetchingEntityTableDataState } from '../states/isFetchingEntityTableDataState';
import { RowContext } from '../states/RowContext';
import { RowIdContext } from '../states/RowIdContext';
import { RowIndexContext } from '../states/RowIndexContext';
import { tableRowIdsState } from '../states/tableRowIdsState';

import { EntityTableRow } from './EntityTableRow';

export function EntityTableBody({ columns }: { columns: Array<TableColumn> }) {
  const rowIds = useRecoilValue(tableRowIdsState);

  const isNavbarSwitchingSize = useRecoilValue(isNavbarSwitchingSizeState);

  const isFetchingEntityTableData = useRecoilValue(
    isFetchingEntityTableDataState,
  );

  console.log(
    'EntityTableBody',
    isFetchingEntityTableData,
    isNavbarSwitchingSize,
  );

  if (isFetchingEntityTableData || isNavbarSwitchingSize) {
    return null;
  }

  return (
    <tbody>
      {rowIds.map((rowId, index) => (
        <RowIdContext.Provider value={rowId} key={rowId}>
          <RowIndexContext.Provider value={index}>
            {/* <RecoilScope SpecificContext={RowContext}> */}
            <EntityTableRow columns={columns} rowId={rowId} index={index} />
            {/* </RecoilScope> */}
          </RowIndexContext.Provider>
        </RowIdContext.Provider>
      ))}
    </tbody>
  );
}
