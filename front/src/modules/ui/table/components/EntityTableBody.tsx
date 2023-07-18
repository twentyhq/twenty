import { useRecoilValue } from 'recoil';

import { TableColumn } from '@/people/table/components/peopleColumns';
import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';
import { RecoilScope } from '@/ui/recoil-scope/components/RecoilScope';

import { isFetchingEntityTableDataState } from '../states/isFetchingEntityTableDataState';
import { RowContext } from '../states/RowContext';
import { tableRowIdsState } from '../states/tableRowIdsState';

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
