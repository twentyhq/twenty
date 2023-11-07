import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { turnFiltersIntoWhereClauseV2 } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClauseV2';
import { turnSortsIntoOrderByV2 } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderByV2';
import { useSetRecordTableData } from '@/ui/object/record-table/hooks/useSetRecordTableData';
import { availableTableColumnsScopedState } from '@/ui/object/record-table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/object/record-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableFiltersScopedState } from '@/ui/object/record-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/object/record-table/states/tableSortsScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';

import { useFindManyObjects } from '../hooks/useFindManyObjects';
import { useObjectMetadataItemInContext } from '../hooks/useObjectMetadataItemInContext';

export const RecordTableEffect = () => {
  const {
    columnDefinitions,
    filterDefinitions,
    sortDefinitions,
    foundObjectMetadataItem,
    objectNamePlural,
  } = useObjectMetadataItemInContext();

  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectId,
  } = useView();

  const setRecordTableData = useSetRecordTableData();

  const tableFilters = useRecoilScopedValue(
    tableFiltersScopedState,
    TableRecoilScopeContext,
  );

  const tableSorts = useRecoilScopedValue(
    tableSortsScopedState,
    TableRecoilScopeContext,
  );

  const { objects, loading } = useFindManyObjects({
    objectNamePlural: objectNamePlural,
    filter: turnFiltersIntoWhereClauseV2(
      tableFilters,
      foundObjectMetadataItem?.fields ?? [],
    ),
    orderBy: turnSortsIntoOrderByV2(
      tableSorts,
      foundObjectMetadataItem?.fields ?? [],
    ),
  });

  useEffect(() => {
    if (!loading) {
      const entities = objects ?? [];

      setRecordTableData(entities);
    }
  }, [objects, setRecordTableData, loading]);

  const tableScopeId = foundObjectMetadataItem?.namePlural ?? '';

  const setAvailableTableColumns = useSetRecoilState(
    availableTableColumnsScopedState(tableScopeId),
  );

  useEffect(() => {
    if (!foundObjectMetadataItem) {
      return;
    }
    setViewObjectId?.(foundObjectMetadataItem.id);
    setViewType?.(ViewType.Table);

    setAvailableSortDefinitions?.(sortDefinitions);
    setAvailableFilterDefinitions?.(filterDefinitions);
    setAvailableFieldDefinitions?.(columnDefinitions);

    setAvailableTableColumns(columnDefinitions);
  }, [
    setAvailableTableColumns,
    setViewObjectId,
    setViewType,
    columnDefinitions,
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    foundObjectMetadataItem,
    sortDefinitions,
    filterDefinitions,
  ]);

  return <></>;
};
