import { useEffect } from 'react';

import { peopleAvailableFieldDefinitions } from '@/people/constants/peopleAvailableFieldDefinitions';
import { availableTableColumnsScopedState } from '@/ui/data/data-table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { tableFiltersScopedState } from '@/ui/data/data-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/data/data-table/states/tableSortsScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useView } from '@/views/hooks/useView';
import { useViewInternalStates } from '@/views/hooks/useViewInternalStates';
import { ViewType } from '~/generated/graphql';
import { peopleAvailableFilters } from '~/pages/people/people-filters';
import { peopleAvailableSorts } from '~/pages/people/people-sorts';

const PeopleTableEffect = () => {
  const {
    setAvailableSorts,
    setAvailableFilters,
    setAvailableFields,
    setViewType,
    setViewObjectId,
  } = useView();
  const { currentViewFields, currentViewSorts, currentViewFilters } =
    useViewInternalStates();

  const [, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );

  const [, setTableSorts] = useRecoilScopedState(
    tableSortsScopedState,
    TableRecoilScopeContext,
  );

  const [, setTableFilters] = useRecoilScopedState(
    tableFiltersScopedState,
    TableRecoilScopeContext,
  );

  const [, setAvailableTableColumns] = useRecoilScopedState(
    availableTableColumnsScopedState,
    TableRecoilScopeContext,
  );

  useEffect(() => {
    setAvailableSorts?.(peopleAvailableSorts);
    setAvailableFilters?.(peopleAvailableFilters);
    setAvailableFields?.(peopleAvailableFieldDefinitions);
    setViewObjectId?.('person');
    setViewType?.(ViewType.Table);

    setAvailableTableColumns(peopleAvailableFieldDefinitions);
  }, [
    setAvailableFields,
    setAvailableFilters,
    setAvailableSorts,
    setAvailableTableColumns,
    setTableColumns,
    setViewObjectId,
    setViewType,
  ]);
  useEffect(() => {
    if (currentViewFields) {
      setTableColumns([...currentViewFields].sort((a, b) => a.index - b.index));
    }
  }, [currentViewFields, setTableColumns]);

  useEffect(() => {
    if (currentViewSorts) {
      setTableSorts(currentViewSorts);
    }
  }, [currentViewFields, currentViewSorts, setTableColumns, setTableSorts]);

  useEffect(() => {
    if (currentViewFilters) {
      setTableFilters(currentViewFilters);
    }
  }, [
    currentViewFields,
    currentViewFilters,
    setTableColumns,
    setTableFilters,
    setTableSorts,
  ]);

  return <></>;
};

export default PeopleTableEffect;
