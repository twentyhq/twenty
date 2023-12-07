import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { turnFiltersIntoWhereClause } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClause';
import { turnSortsIntoOrderBy } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordTableScopedStates } from '@/ui/object/record-table/hooks/internal/useRecordTableScopedStates';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';

import { useFindManyRecords } from './useFindManyRecords';

export const useObjectRecordTable = () => {
  const { scopeId: objectNamePlural, setRecordTableData } = useRecordTable();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
  );
  const { tableFiltersState, tableSortsState, tableLastRowVisibleState } =
    useRecordTableScopedStates();

  const tableFilters = useRecoilValue(tableFiltersState);
  const tableSorts = useRecoilValue(tableSortsState);
  const setLastRowVisible = useSetRecoilState(tableLastRowVisibleState);

  const filter = turnFiltersIntoWhereClause(
    tableFilters,
    foundObjectMetadataItem?.fields ?? [],
  );
  const orderBy = turnSortsIntoOrderBy(
    tableSorts,
    foundObjectMetadataItem?.fields ?? [],
  );

  const { records, loading, fetchMoreRecords, queryStateIdentifier } =
    useFindManyRecords({
      objectNameSingular,
      filter,
      orderBy,
      onCompleted: () => {
        setLastRowVisible(false);
      },
    });

  return {
    records,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
    setRecordTableData,
  };
};
