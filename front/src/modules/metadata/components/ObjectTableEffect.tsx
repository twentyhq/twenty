import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { availableTableColumnsScopedState } from '@/ui/data/data-table/states/availableTableColumnsScopedState';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';

import { useMetadataObjectInContext } from '../hooks/useMetadataObjectInContext';

export const ObjectTableEffect = () => {
  const {
    setAvailableSorts,
    setAvailableFilters,
    setAvailableFields,
    setViewType,
    setViewObjectId,
  } = useView();

  // const [, setTableColumns] = useRecoilScopedState(
  //   tableColumnsScopedState,
  //   TableRecoilScopeContext,
  // );

  // const [, setTableSorts] = useRecoilScopedState(
  //   tableSortsScopedState,
  //   TableRecoilScopeContext,
  // );

  // const [, setTableFilters] = useRecoilScopedState(
  //   tableFiltersScopedState,
  //   TableRecoilScopeContext,
  // );

  const { columnDefinitions, objectNamePlural } = useMetadataObjectInContext();

  const setAvailableTableColumns = useSetRecoilState(
    availableTableColumnsScopedState(objectNamePlural ?? ''),
  );

  useEffect(() => {
    setAvailableSorts?.([]); // TODO: extract from metadata fields
    setAvailableFilters?.([]); // TODO: extract from metadata fields
    setAvailableFields?.(columnDefinitions);
    setViewObjectId?.(objectNamePlural);
    setViewType?.(ViewType.Table);

    setAvailableTableColumns(columnDefinitions);
  }, [
    setAvailableFields,
    setAvailableFilters,
    setAvailableSorts,
    setAvailableTableColumns,
    setViewObjectId,
    setViewType,
    columnDefinitions,
    objectNamePlural,
  ]);

  // useEffect(() => {
  //   if (currentViewFields) {
  //     setTableColumns([...currentViewFields].sort((a, b) => a.index - b.index));
  //   }
  // }, [currentViewFields, setTableColumns]);

  // useEffect(() => {
  //   if (currentViewSorts) {
  //     setTableSorts(currentViewSorts);
  //   }
  // }, [currentViewFields, currentViewSorts, setTableColumns, setTableSorts]);

  // useEffect(() => {
  //   if (currentViewFilters) {
  //     setTableFilters(currentViewFilters);
  //   }
  // }, [
  //   currentViewFields,
  //   currentViewFilters,
  //   setTableColumns,
  //   setTableFilters,
  //   setTableSorts,
  // ]);

  return <></>;
};
