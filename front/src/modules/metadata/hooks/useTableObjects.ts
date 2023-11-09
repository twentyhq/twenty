import { useEffect } from 'react';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { turnFiltersIntoWhereClauseV2 } from '@/ui/object/object-filter-dropdown/utils/turnFiltersIntoWhereClauseV2';
import { turnSortsIntoOrderByV2 } from '@/ui/object/object-sort-dropdown/utils/turnSortsIntoOrderByV2';
import { useSetRecordTableData } from '@/ui/object/record-table/hooks/useSetRecordTableData';
import { TableRecoilScopeContext } from '@/ui/object/record-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableFiltersScopedState } from '@/ui/object/record-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/object/record-table/states/tableSortsScopedState';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';

import { getRecordOptimisticEffectDefinition } from '../graphql/optimistic-effect-definition/getRecordOptimisticEffectDefinition';

import { useFindManyObjects } from './useFindManyObjects';
import { useObjectMetadataItemInContext } from './useObjectMetadataItemInContext';

export const useTableObjects = () => {
  const setRecordTableData = useSetRecordTableData();
  const { registerOptimisticEffect } = useOptimisticEffect();

  const { foundObjectMetadataItem, objectNamePlural } =
    useObjectMetadataItemInContext();

  const tableFilters = useRecoilScopedValue(
    tableFiltersScopedState,
    TableRecoilScopeContext,
  );

  const tableSorts = useRecoilScopedValue(
    tableSortsScopedState,
    TableRecoilScopeContext,
  );

  const filter = turnFiltersIntoWhereClauseV2(
    tableFilters,
    foundObjectMetadataItem?.fields ?? [],
  );

  const orderBy = turnSortsIntoOrderByV2(
    tableSorts,
    foundObjectMetadataItem?.fields ?? [],
  );

  useEffect(() => {
    if (foundObjectMetadataItem) {
      console.log('registerOptimisticEffect');
      registerOptimisticEffect({
        variables: { orderBy, filter },
        definition: getRecordOptimisticEffectDefinition({
          objectMetadataItem: foundObjectMetadataItem,
        }),
      });
    }
  }, [foundObjectMetadataItem, registerOptimisticEffect, orderBy, filter]);

  const { objects, loading, fetchMoreObjects } = useFindManyObjects({
    objectNamePlural,
    filter,
    orderBy,
    onCompleted: (data) => {
      const entities = data.edges.map((edge) => edge.node) ?? [];

      console.log('setRecordTableData');

      setRecordTableData(entities);
    },
  });

  return {
    objects,
    loading,
    fetchMoreObjects,
  };
};
