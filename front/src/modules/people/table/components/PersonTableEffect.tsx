import { useEffect } from 'react';

import { peopleAvailableFieldDefinitions } from '@/people/constants/peopleAvailableFieldDefinitions';
import { availableTableColumnsScopedState } from '@/ui/data/data-table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';
import { personTableFilterDefinitions } from '~/pages/people/constants/personTableFilterDefinitions';
import { personTableSortDefinitions } from '~/pages/people/constants/personTableSortDefinitions';

const PeopleTableEffect = () => {
  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectId,
  } = useView();

  const [, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );

  const [, setAvailableTableColumns] = useRecoilScopedState(
    availableTableColumnsScopedState,
    TableRecoilScopeContext,
  );

  useEffect(() => {
    setAvailableSortDefinitions?.(personTableSortDefinitions);
    setAvailableFilterDefinitions?.(personTableFilterDefinitions);
    setAvailableFieldDefinitions?.(peopleAvailableFieldDefinitions);
    setViewObjectId?.('person');
    setViewType?.(ViewType.Table);

    setAvailableTableColumns(peopleAvailableFieldDefinitions);
  }, [
    setAvailableFieldDefinitions,
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    setAvailableTableColumns,
    setTableColumns,
    setViewObjectId,
    setViewType,
  ]);

  return <></>;
};

export default PeopleTableEffect;
