import { useRecoilValue } from 'recoil';

import { TableColumn } from '@/people/table/components/peopleColumns';
import { RecoilScope } from '@/recoil-scope/components/RecoilScope';
import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';
import { isFetchingEntityTableDataState } from '@/ui/tables/states/isFetchingEntityTableDataState';
import { RowContext } from '@/ui/tables/states/RowContext';
import { tableRowIdsState } from '@/ui/tables/states/tableRowIdsState';

import { EntityTableRow } from './EntityTableRow';

export function EntityTableBody({ columns }: { columns: Array<TableColumn> }) {
  const rowIds = useRecoilValue(tableRowIdsState);

  const isNavbarSwitchingSize = useRecoilValue(isNavbarSwitchingSizeState);

  const isFetchingEntityTableData = useRecoilValue(
    isFetchingEntityTableDataState,
  );

  return (
    <tbody>
      {!isFetchingEntityTableData && !isNavbarSwitchingSize
        ? rowIds.map((rowId, index) => (
            <RecoilScope SpecificContext={RowContext} key={rowId}>
              <EntityTableRow columns={columns} rowId={rowId} index={index} />
            </RecoilScope>
          ))
        : null}
    </tbody>
  );
}
