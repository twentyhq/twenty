import { useRecoilValue } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { turnFiltersIntoWhereClauseV2 } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClauseV2';
import { turnSortsIntoOrderByV2 } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderByV2';
import { useRecordTableScopedStates } from '@/ui/object/record-table/hooks/internal/useRecordTableScopedStates';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';

import { getRecordOptimisticEffectDefinition } from '../graphql/optimistic-effect-definition/getRecordOptimisticEffectDefinition';

import { useFindManyObjectRecords } from './useFindManyObjectRecords';

export const useObjectRecordTable = () => {
  const { scopeId: objectNamePlural } = useRecordTable();

  const { registerOptimisticEffect } = useOptimisticEffect();

  const { foundObjectMetadataItem } = useFindOneObjectMetadataItem({
    objectNamePlural,
  });

  const { setRecordTableData } = useRecordTable();

  const { tableFiltersState, tableSortsState } = useRecordTableScopedStates();

  const tableFilters = useRecoilValue(tableFiltersState);
  const tableSorts = useRecoilValue(tableSortsState);

  const filter = turnFiltersIntoWhereClauseV2(
    tableFilters,
    foundObjectMetadataItem?.fields ?? [],
  );

  const orderBy = turnSortsIntoOrderByV2(
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
          variables: { orderBy, filter },
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
