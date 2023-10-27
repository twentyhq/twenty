import { useEffect } from 'react';

import { availableTableColumnsScopedState } from '@/ui/data/data-table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { tableFiltersScopedState } from '@/ui/data/data-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/data/data-table/states/tableSortsScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useView } from '@/views/hooks/useView';
import { useViewInternalStates } from '@/views/hooks/useViewInternalStates';
import { ViewType } from '~/generated/graphql';

import { useMetadataObjectInContext } from '../hooks/useMetadataObjectInContext';

export const ObjectTableEffect = () => {
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

  const { columnDefinitions, objectNamePlural } = useMetadataObjectInContext();

  useEffect(() => {
    // setAvailableSorts?.([]); // TODO: extract from metadata fields
    // setAvailableFilters?.([]); // TODO: extract from metadata fields
    setAvailableFields?.(columnDefinitions);
    setViewObjectId?.(objectNamePlural);
    setViewType?.(ViewType.Table);

    // setAvailableTableColumns(columnDefinitions);
  }, [
    setAvailableFields,
    setAvailableFilters,
    setAvailableSorts,
    setAvailableTableColumns,
    setTableColumns,
    setViewObjectId,
    setViewType,
    columnDefinitions,
    objectNamePlural,
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
