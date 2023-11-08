import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { turnFiltersIntoWhereClauseV2 } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClauseV2';
import { turnSortsIntoOrderByV2 } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderByV2';
import { useRecordTableScopedStates } from '@/ui/object/record-table/hooks/internal/useRecordTableScopedStates';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';

import { useRecordTable } from '../../ui/object/record-table/hooks/useRecordTable';
import { useFindManyObjects } from '../hooks/useFindManyObjects';
import { useFindOneObjectMetadataItem } from '../hooks/useFindOneObjectMetadataItem';

export const RecordTableEffect = () => {
  const { scopeId } = useRecordTable();

  const {
    foundObjectMetadataItem,
    columnDefinitions,
    filterDefinitions,
    sortDefinitions,
  } = useFindOneObjectMetadataItem({
    objectNamePlural: scopeId,
  });
  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectId,
  } = useView();

  const { setRecordTableData, setAvailableTableColumns } = useRecordTable();

  const { tableFiltersState, tableSortsState } = useRecordTableScopedStates();

  const tableFilters = useRecoilValue(tableFiltersState);
  const tableSorts = useRecoilValue(tableSortsState);

  const { objects, loading } = useFindManyObjects({
    objectNamePlural: scopeId,
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
