import { useRecoilValue } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { turnFiltersIntoWhereClause } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClause';
import { turnSortsIntoOrderBy } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordTableScopedStates } from '@/ui/object/record-table/hooks/internal/useRecordTableScopedStates';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';

import { getRecordOptimisticEffectDefinition } from '../graphql/optimistic-effect-definition/getRecordOptimisticEffectDefinition';

import { useFindManyObjectRecords } from './useFindManyObjectRecords';

export const useObjectRecordTable = () => {
  const { scopeId: objectNamePlural } = useRecordTable();

  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNamePlural,
    },
  );

  const { registerOptimisticEffect } = useOptimisticEffect({
    objectNameSingular: foundObjectMetadataItem?.nameSingular,
  });

  const { setRecordTableData } = useRecordTable();

  const { tableFiltersState, tableSortsState } = useRecordTableScopedStates();

  const tableFilters = useRecoilValue(tableFiltersState);
  const tableSorts = useRecoilValue(tableSortsState);

  const filter = turnFiltersIntoWhereClause(
    tableFilters,
    foundObjectMetadataItem?.fields ?? [],
  );
  const orderBy = turnSortsIntoOrderBy(
    tableSorts,
    foundObjectMetadataItem?.fields ?? [],
  );

  const { objects, loading, fetchMoreObjects } = useFindManyObjectRecords({
    objectNamePlural,
    filter,
    orderBy,
    onCompleted: (data) => {
      const entities = data.edges.map((edge) => edge.node) ?? [];

      setRecordTableData(entities);

      if (foundObjectMetadataItem) {
        registerOptimisticEffect({
          variables: { orderBy, filter, limit: 60 },
          definition: getRecordOptimisticEffectDefinition({
            objectMetadataItem: foundObjectMetadataItem,
          }),
        });
      }
    },
  });

  return {
    objects,
    loading,
    fetchMoreObjects,
  };
};
